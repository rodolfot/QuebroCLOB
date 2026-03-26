document.addEventListener('DOMContentLoaded', () => {
    const xmlInput = document.getElementById('xmlInput');
    const tableName = document.getElementById('tableName');
    const operationType = document.getElementById('operationType');
    const chunkSize = document.getElementById('chunkSize');
    const whereClause = document.getElementById('whereClause');
    const extraColumns = document.getElementById('extraColumns');
    const updateFields = document.getElementById('updateFields');
    const insertFields = document.getElementById('insertFields');
    const btnGenerate = document.getElementById('btnGenerate');
    const btnLoadFile = document.getElementById('btnLoadFile');
    const btnClearXml = document.getElementById('btnClearXml');
    const btnCopy = document.getElementById('btnCopy');
    const btnDownload = document.getElementById('btnDownload');
    const fileInput = document.getElementById('fileInput');
    const charCount = document.getElementById('charCount');
    const outputSection = document.getElementById('outputSection');
    const sqlOutput = document.getElementById('sqlOutput').querySelector('code');
    const sqlInfo = document.getElementById('sqlInfo');

    // Toggle campos INSERT/UPDATE
    operationType.addEventListener('change', () => {
        const isUpdate = operationType.value === 'UPDATE';
        updateFields.classList.toggle('hidden', !isUpdate);
        insertFields.classList.toggle('hidden', isUpdate);
    });

    // Contador de caracteres
    xmlInput.addEventListener('input', updateCharCount);

    function updateCharCount() {
        const len = xmlInput.value.length;
        charCount.textContent = `${len.toLocaleString('pt-BR')} caracteres`;
        charCount.classList.toggle('warning', len > 200000);
    }

    // Carregar arquivo
    btnLoadFile.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            xmlInput.value = ev.target.result;
            updateCharCount();
        };
        reader.readAsText(file, 'UTF-8');
        fileInput.value = '';
    });

    // Limpar XML
    btnClearXml.addEventListener('click', () => {
        xmlInput.value = '';
        updateCharCount();
        outputSection.classList.add('hidden');
    });

    // Escapar aspas simples para Oracle
    function escapeOracle(str) {
        return str.replace(/'/g, "''");
    }

    // Quebrar string em chunks
    function splitIntoChunks(str, size) {
        const chunks = [];
        for (let i = 0; i < str.length; i += size) {
            chunks.push(str.substring(i, i + size));
        }
        return chunks;
    }

    // Parsear colunas extras
    function parseExtraColumns(text) {
        if (!text.trim()) return [];
        return text.trim().split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                const eqIndex = line.indexOf('=');
                if (eqIndex === -1) return null;
                return {
                    name: line.substring(0, eqIndex).trim(),
                    value: line.substring(eqIndex + 1).trim()
                };
            })
            .filter(col => col !== null);
    }

    // Gerar SQL
    btnGenerate.addEventListener('click', () => {
        const xml = xmlInput.value;
        const table = tableName.value.trim();
        const operation = operationType.value;
        const size = parseInt(chunkSize.value, 10);

        if (!xml) {
            alert('Informe o XML de entrada.');
            return;
        }
        if (!table) {
            alert('Informe o nome da tabela.');
            return;
        }
        if (operation === 'UPDATE' && !whereClause.value.trim()) {
            alert('Informe a clausula WHERE para o UPDATE.');
            return;
        }

        const escapedXml = escapeOracle(xml);
        const chunks = splitIntoChunks(escapedXml, size);
        let sql = '';

        if (chunks.length === 1) {
            sql = generateSimpleSQL(table, operation, chunks[0]);
        } else {
            sql = generateClobSQL(table, operation, chunks);
        }

        sqlOutput.textContent = sql;
        sqlInfo.textContent = `${chunks.length} chunk(s) | ${xml.length.toLocaleString('pt-BR')} caracteres`;
        outputSection.classList.remove('hidden');
        outputSection.scrollIntoView({ behavior: 'smooth' });
    });

    function generateSimpleSQL(table, operation, content) {
        if (operation === 'INSERT') {
            const cols = parseExtraColumns(extraColumns.value);
            const colNames = ['ds_content', ...cols.map(c => c.name)];
            const colValues = [`'${content}'`, ...cols.map(c => c.value)];
            return `INSERT INTO ${table} (${colNames.join(', ')})\nVALUES (${colValues.join(', ')});\nCOMMIT;`;
        } else {
            const where = whereClause.value.trim();
            return `UPDATE ${table}\n   SET ds_content = '${content}'\n WHERE ${where};\nCOMMIT;`;
        }
    }

    function generateClobSQL(table, operation, chunks) {
        const lines = [];
        lines.push('DECLARE');
        lines.push('    v_clob CLOB;');
        lines.push('BEGIN');
        lines.push('    DBMS_LOB.CREATETEMPORARY(v_clob, TRUE);');
        lines.push('');

        chunks.forEach((chunk, i) => {
            if (i === 0) {
                lines.push(`    v_clob := TO_CLOB('${chunk}');`);
            } else {
                lines.push(`    DBMS_LOB.APPEND(v_clob, TO_CLOB('${chunk}'));`);
            }
        });

        lines.push('');

        if (operation === 'INSERT') {
            const cols = parseExtraColumns(extraColumns.value);
            const colNames = ['ds_content', ...cols.map(c => c.name)];
            const colValues = ['v_clob', ...cols.map(c => c.value)];
            lines.push(`    INSERT INTO ${table} (${colNames.join(', ')})`);
            lines.push(`    VALUES (${colValues.join(', ')});`);
        } else {
            const where = whereClause.value.trim();
            lines.push(`    UPDATE ${table}`);
            lines.push(`       SET ds_content = v_clob`);
            lines.push(`     WHERE ${where};`);
        }

        lines.push('');
        lines.push('    DBMS_LOB.FREETEMPORARY(v_clob);');
        lines.push('    COMMIT;');
        lines.push('END;');
        lines.push('/');

        return lines.join('\n');
    }

    // Copiar SQL
    btnCopy.addEventListener('click', () => {
        const sql = sqlOutput.textContent;
        navigator.clipboard.writeText(sql).then(() => {
            const original = btnCopy.textContent;
            btnCopy.textContent = 'Copiado!';
            setTimeout(() => { btnCopy.textContent = original; }, 2000);
        });
    });

    // Baixar .sql
    btnDownload.addEventListener('click', () => {
        const sql = sqlOutput.textContent;
        const table = tableName.value.trim() || 'output';
        const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${table}_clob.sql`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});
