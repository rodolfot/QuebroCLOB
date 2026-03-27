document.addEventListener('DOMContentLoaded', () => {
    const btnTypeFD = document.getElementById('btnTypeFD');
    const btnTypeEV = document.getElementById('btnTypeEV');
    const fdFields = document.getElementById('fdFields');
    const evFields = document.getElementById('evFields');
    const fdSlots = document.getElementById('fdSlots');
    const evSlots = document.getElementById('evSlots');
    const btnAddFdSlot = document.getElementById('btnAddFdSlot');
    const btnAddEvSlot = document.getElementById('btnAddEvSlot');
    const chunkSize = document.getElementById('chunkSize');
    const btnGenerate = document.getElementById('btnGenerate');
    const fileInput = document.getElementById('fileInput');
    const outputContainer = document.getElementById('outputContainer');
    const globalUsuario = document.getElementById('globalUsuario');
    const globalSenha = document.getElementById('globalSenha');
    const globalBanco = document.getElementById('globalBanco');

    let currentType = 'FD';
    let fdSlotCount = 0;
    let evSlotCount = 0;
    let activeFileSlot = null;

    // ========== Toggle FD / EV ==========
    btnTypeFD.addEventListener('click', () => {
        currentType = 'FD';
        btnTypeFD.classList.add('active');
        btnTypeEV.classList.remove('active');
        fdFields.classList.remove('hidden');
        evFields.classList.add('hidden');
        outputContainer.innerHTML = '';
        if (fdSlotCount === 0) addFdSlot();
    });

    btnTypeEV.addEventListener('click', () => {
        currentType = 'EV';
        btnTypeEV.classList.add('active');
        btnTypeFD.classList.remove('active');
        evFields.classList.remove('hidden');
        fdFields.classList.add('hidden');
        outputContainer.innerHTML = '';
        if (evSlotCount === 0) addEvSlot();
    });

    // Inicializa com 1 slot FD
    addFdSlot();

    // ========== FD: Adicionar conjunto ==========
    btnAddFdSlot.addEventListener('click', () => addFdSlot());

    function addFdSlot() {
        fdSlotCount++;
        const num = fdSlotCount;
        const slot = document.createElement('div');
        slot.className = 'fd-conjunto';
        slot.dataset.num = num;
        slot.innerHTML = `
            <div class="conjunto-header">
                <span class="conjunto-title">Conjunto ${num}</span>
                ${num > 1 ? `<button type="button" class="btn-remove-slot btn-remove-fd" data-num="${num}">Remover</button>` : ''}
            </div>
            <div class="form-row four-cols">
                <div class="form-group">
                    <label for="fdAbrev_${num}">Abreviacao</label>
                    <input type="text" id="fdAbrev_${num}" placeholder="Ex: BR">
                </div>
                <div class="form-group">
                    <label for="fdNome_${num}">Nome</label>
                    <input type="text" id="fdNome_${num}" placeholder="Ex: Brasil">
                </div>
                <div class="form-group">
                    <label for="fdCodigo_${num}">Codigo</label>
                    <input type="text" id="fdCodigo_${num}" placeholder="Ex: CTC_001">
                </div>
                <div class="form-group">
                    <label for="fdTConfig_${num}">Tabela</label>
                    <input type="text" id="fdTConfig_${num}" placeholder="Ex: FD_BRASIL">
                </div>
            </div>
            <div class="xml-slot">
                <div class="xml-slot-header">
                    <label>XML_1</label>
                    <div class="xml-slot-actions">
                        <button type="button" class="btn-load-xml" data-slot="fd${num}_1">Carregar arquivo</button>
                        <button type="button" class="btn-clear-xml" data-slot="fd${num}_1">Limpar</button>
                        <span class="char-count" id="charCount_fd${num}_1">0 caracteres</span>
                    </div>
                </div>
                <textarea id="xml_fd${num}_1" rows="5" placeholder="Cole o XML aqui ou carregue um arquivo..."></textarea>
            </div>
            <div class="xml-slot">
                <div class="xml-slot-header">
                    <label>XML_2</label>
                    <div class="xml-slot-actions">
                        <button type="button" class="btn-load-xml" data-slot="fd${num}_2">Carregar arquivo</button>
                        <button type="button" class="btn-clear-xml" data-slot="fd${num}_2">Limpar</button>
                        <span class="char-count" id="charCount_fd${num}_2">0 caracteres</span>
                    </div>
                </div>
                <textarea id="xml_fd${num}_2" rows="5" placeholder="Cole o XML aqui ou carregue um arquivo..."></textarea>
            </div>
        `;
        fdSlots.appendChild(slot);
        bindSlotEvents(slot, 'fd', num);
    }

    function bindSlotEvents(slot, prefix, num) {
        // Load file buttons
        slot.querySelectorAll('.btn-load-xml').forEach(btn => {
            btn.addEventListener('click', () => {
                activeFileSlot = btn.dataset.slot;
                fileInput.click();
            });
        });

        // Clear buttons
        slot.querySelectorAll('.btn-clear-xml').forEach(btn => {
            btn.addEventListener('click', () => {
                const textarea = document.getElementById(`xml_${btn.dataset.slot}`);
                textarea.value = '';
                updateCharCount(btn.dataset.slot, textarea);
            });
        });

        // Textarea char counts
        slot.querySelectorAll('textarea').forEach(ta => {
            const slotId = ta.id.replace('xml_', '');
            ta.addEventListener('input', () => updateCharCount(slotId, ta));
        });

        // Remove button
        const removeBtn = slot.querySelector('.btn-remove-slot');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                slot.remove();
                if (prefix === 'fd') {
                    fdSlotCount--;
                    renumberFdSlots();
                } else {
                    evSlotCount--;
                    renumberEvSlots();
                }
            });
        }
    }

    function renumberFdSlots() {
        const slots = fdSlots.querySelectorAll('.fd-conjunto');
        fdSlotCount = slots.length;
        slots.forEach((slot, i) => {
            const num = i + 1;
            slot.dataset.num = num;
            slot.querySelector('.conjunto-title').textContent = `Conjunto ${num}`;

            // Update IDs
            const abrev = slot.querySelector('input[id^="fdAbrev_"]');
            abrev.id = `fdAbrev_${num}`;
            const nome = slot.querySelector('input[id^="fdNome_"]');
            nome.id = `fdNome_${num}`;
            const codigo = slot.querySelector('input[id^="fdCodigo_"]');
            codigo.id = `fdCodigo_${num}`;
            const tconfig = slot.querySelector('input[id^="fdTConfig_"]');
            tconfig.id = `fdTConfig_${num}`;

            const textareas = slot.querySelectorAll('textarea');
            textareas[0].id = `xml_fd${num}_1`;
            textareas[1].id = `xml_fd${num}_2`;

            const charSpans = slot.querySelectorAll('.char-count');
            charSpans[0].id = `charCount_fd${num}_1`;
            charSpans[1].id = `charCount_fd${num}_2`;

            // Update data-slot attributes
            const loadBtns = slot.querySelectorAll('.btn-load-xml');
            loadBtns[0].dataset.slot = `fd${num}_1`;
            loadBtns[1].dataset.slot = `fd${num}_2`;
            const clearBtns = slot.querySelectorAll('.btn-clear-xml');
            clearBtns[0].dataset.slot = `fd${num}_1`;
            clearBtns[1].dataset.slot = `fd${num}_2`;

            // Remove button logic
            const existingRemove = slot.querySelector('.btn-remove-slot');
            if (num === 1 && existingRemove) {
                existingRemove.remove();
            } else if (num > 1 && !existingRemove) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-remove-slot btn-remove-fd';
                btn.dataset.num = num;
                btn.textContent = 'Remover';
                slot.querySelector('.conjunto-header').appendChild(btn);
            }

            // Rebind all events
            rebindSlotEvents(slot, 'fd', num);
        });
    }

    // ========== EV: Adicionar slot ==========
    btnAddEvSlot.addEventListener('click', () => addEvSlot());

    function addEvSlot() {
        if (evSlotCount >= 7) {
            alert('Maximo de 7 XMLs para EV.');
            return;
        }
        evSlotCount++;
        const num = evSlotCount;
        const slot = document.createElement('div');
        slot.className = 'xml-slot ev-item';
        slot.dataset.num = num;
        slot.innerHTML = `
            <div class="xml-slot-header">
                <label>XML_${num}</label>
                <div class="xml-slot-actions">
                    <button type="button" class="btn-load-xml" data-slot="ev${num}">Carregar arquivo</button>
                    <button type="button" class="btn-clear-xml" data-slot="ev${num}">Limpar</button>
                    <span class="char-count" id="charCount_ev${num}">0 caracteres</span>
                    ${num > 1 ? `<button type="button" class="btn-remove-slot" data-num="${num}">Remover</button>` : ''}
                </div>
            </div>
            <div class="ev-slot-fields">
                <div>
                    <label for="evNm_${num}">Nome</label>
                    <input type="text" id="evNm_${num}" placeholder="Ex: Nome da configuracao">
                </div>
                <div>
                    <label for="evDs_${num}">Descricao</label>
                    <input type="text" id="evDs_${num}" placeholder="Ex: Descricao da configuracao">
                </div>
            </div>
            <textarea id="xml_ev${num}" rows="6" placeholder="Cole o XML aqui ou carregue um arquivo..."></textarea>
        `;
        evSlots.appendChild(slot);

        const textarea = slot.querySelector(`#xml_ev${num}`);
        textarea.addEventListener('input', () => updateCharCount(`ev${num}`, textarea));

        slot.querySelector('.btn-load-xml').addEventListener('click', () => {
            activeFileSlot = `ev${num}`;
            fileInput.click();
        });
        slot.querySelector('.btn-clear-xml').addEventListener('click', () => {
            textarea.value = '';
            updateCharCount(`ev${num}`, textarea);
        });

        const removeBtn = slot.querySelector('.btn-remove-slot');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                slot.remove();
                evSlotCount--;
                renumberEvSlots();
            });
        }

        updateEvBtnVisibility();
    }

    function renumberEvSlots() {
        const slots = evSlots.querySelectorAll('.ev-item');
        evSlotCount = slots.length;
        slots.forEach((slot, i) => {
            const num = i + 1;
            slot.dataset.num = num;
            slot.querySelector('.xml-slot-header label').textContent = `XML_${num}`;

            const textarea = slot.querySelector('textarea');
            textarea.id = `xml_ev${num}`;

            const charSpan = slot.querySelector('.char-count');
            charSpan.id = `charCount_ev${num}`;

            const nmInput = slot.querySelector('input[id^="evNm_"]');
            nmInput.id = `evNm_${num}`;
            const dsInput = slot.querySelector('input[id^="evDs_"]');
            dsInput.id = `evDs_${num}`;

            slot.querySelector('.btn-load-xml').dataset.slot = `ev${num}`;
            slot.querySelector('.btn-clear-xml').dataset.slot = `ev${num}`;

            // Remove button
            const existingRemove = slot.querySelector('.btn-remove-slot');
            if (num === 1 && existingRemove) {
                existingRemove.remove();
            } else if (num > 1 && !existingRemove) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-remove-slot';
                btn.dataset.num = num;
                btn.textContent = 'Remover';
                slot.querySelector('.xml-slot-actions').appendChild(btn);
            }

            rebindSlotEvents(slot, 'ev', num);
        });
        updateEvBtnVisibility();
    }

    function rebindSlotEvents(slot, prefix, num) {
        // Clone and rebind to remove old listeners
        slot.querySelectorAll('.btn-load-xml').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => {
                activeFileSlot = newBtn.dataset.slot;
                fileInput.click();
            });
        });

        slot.querySelectorAll('.btn-clear-xml').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => {
                const textarea = document.getElementById(`xml_${newBtn.dataset.slot}`);
                textarea.value = '';
                updateCharCount(newBtn.dataset.slot, textarea);
            });
        });

        slot.querySelectorAll('textarea').forEach(ta => {
            const newTa = ta.cloneNode(true);
            ta.parentNode.replaceChild(newTa, ta);
            const slotId = newTa.id.replace('xml_', '');
            newTa.addEventListener('input', () => updateCharCount(slotId, newTa));
        });

        const removeBtn = slot.querySelector('.btn-remove-slot');
        if (removeBtn) {
            const newRemove = removeBtn.cloneNode(true);
            removeBtn.parentNode.replaceChild(newRemove, removeBtn);
            newRemove.addEventListener('click', () => {
                slot.remove();
                if (prefix === 'fd') {
                    fdSlotCount--;
                    renumberFdSlots();
                } else {
                    evSlotCount--;
                    renumberEvSlots();
                }
            });
        }
    }

    function updateEvBtnVisibility() {
        btnAddEvSlot.classList.toggle('hidden', evSlotCount >= 7);
    }

    // ========== File input handler ==========
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file || !activeFileSlot) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const textarea = document.getElementById(`xml_${activeFileSlot}`);
            if (textarea) {
                textarea.value = ev.target.result;
                updateCharCount(activeFileSlot, textarea);
            }
            activeFileSlot = null;
        };
        reader.readAsText(file, 'UTF-8');
        fileInput.value = '';
    });

    // ========== Contagem de caracteres ==========
    function updateCharCount(slotId, textarea) {
        const span = document.getElementById(`charCount_${slotId}`);
        if (!span) return;
        const len = textarea.value.length;
        span.textContent = `${len.toLocaleString('pt-BR')} caracteres`;
        span.classList.toggle('warning', len > 4000);
    }

    // ========== Escapar aspas simples para Oracle ==========
    function escapeOracle(str) {
        return str.replace(/'/g, "''");
    }

    // ========== Quebrar em chunks (sem partir '' no meio) ==========
    function splitIntoChunks(escapedStr, size) {
        const chunks = [];
        let i = 0;
        while (i < escapedStr.length) {
            let end = Math.min(i + size, escapedStr.length);
            if (end < escapedStr.length) {
                let quoteCount = 0;
                let pos = end - 1;
                while (pos >= i && escapedStr[pos] === "'") {
                    quoteCount++;
                    pos--;
                }
                if (quoteCount % 2 !== 0) {
                    end--;
                }
            }
            chunks.push(escapedStr.substring(i, end));
            i = end;
        }
        return chunks;
    }

    // ========== Gerar chunks PL/SQL ==========
    function generateClobChunks(varName, chunks, indent) {
        const lines = [];
        chunks.forEach((chunk, i) => {
            if (i === 0) {
                lines.push(`${indent}${varName} := TO_CLOB('${chunk}');`);
            } else {
                lines.push(`${indent}DBMS_LOB.APPEND(${varName}, TO_CLOB('${chunk}'));`);
            }
        });
        return lines;
    }

    // ========== Cabecalho SQL ==========
    function generateHeader(defines) {
        const usuario = globalUsuario.value.trim() || '&usuario';
        const senha = globalSenha.value.trim() || '&senha';
        const banco = globalBanco.value.trim() || '&BANCO';

        const lines = [];
        lines.push('-- definir usuario/senha e banco antes de rodar');
        lines.push(`connect ${usuario}/${senha}@${banco}`);
        lines.push('');
        lines.push('set heading on');
        lines.push('set pages 0');
        lines.push('set lines 500');
        lines.push('set serveroutput on');
        lines.push('--show user');
        lines.push('');
        lines.push('-- Variaveis --');
        defines.forEach(d => {
            lines.push(`DEFINE ${d.name} = '${d.value}'`);
        });
        lines.push('');
        return lines;
    }

    // ========== GERAR SQL ==========
    btnGenerate.addEventListener('click', () => {
        const size = parseInt(chunkSize.value, 10);
        outputContainer.innerHTML = '';

        if (currentType === 'FD') {
            generateFD(size);
        } else {
            generateEV(size);
        }
    });

    // ========== FD ==========
    function generateFD(size) {
        const slots = fdSlots.querySelectorAll('.fd-conjunto');
        const results = [];

        for (let i = 0; i < slots.length; i++) {
            const num = i + 1;
            const abrev = document.getElementById(`fdAbrev_${num}`).value.trim();
            const nome = document.getElementById(`fdNome_${num}`).value.trim();
            const codigo = document.getElementById(`fdCodigo_${num}`).value.trim();
            const tconfig = document.getElementById(`fdTConfig_${num}`).value.trim();
            const xml1 = document.getElementById(`xml_fd${num}_1`).value;
            const xml2 = document.getElementById(`xml_fd${num}_2`).value;

            if (!abrev) { alert(`Conjunto ${num}: Informe a Abreviacao.`); return; }
            if (!nome) { alert(`Conjunto ${num}: Informe o Nome.`); return; }
            if (!codigo) { alert(`Conjunto ${num}: Informe o Codigo.`); return; }
            if (!tconfig) { alert(`Conjunto ${num}: Informe a Tabela.`); return; }
            if (!xml1 && !xml2) { alert(`Conjunto ${num}: Informe pelo menos um XML.`); return; }

            const hasXml1 = xml1.length > 0;
            const hasXml2 = xml2.length > 0;

            const header = generateHeader([
                { name: 'v_var1', value: abrev },
                { name: 'v_var2', value: nome },
                { name: 'v_var3', value: codigo },
                { name: 'v_var4', value: tconfig }
            ]);

            const lines = [...header];
            lines.push('DECLARE');
            const vars = [];

            if (hasXml1) {
                lines.push('    v_DS_CONTENT_LAYOUT_CTC CLOB;');
                vars.push('v_DS_CONTENT_LAYOUT_CTC');
            }
            if (hasXml2) {
                lines.push('    v_DS_PERSIST_LAYOUT_CTC CLOB;');
                vars.push('v_DS_PERSIST_LAYOUT_CTC');
            }

            lines.push('BEGIN');

            if (hasXml1) {
                const escaped1 = escapeOracle(xml1);
                const chunks1 = splitIntoChunks(escaped1, size);
                lines.push('    DBMS_LOB.CREATETEMPORARY(v_DS_CONTENT_LAYOUT_CTC, TRUE);');
                lines.push('');
                lines.push(...generateClobChunks('v_DS_CONTENT_LAYOUT_CTC', chunks1, '    '));
                lines.push('');
            }

            if (hasXml2) {
                lines.push('    DBMS_LOB.CREATETEMPORARY(v_DS_PERSIST_LAYOUT_CTC, TRUE);');
                lines.push('');
                const escaped2 = escapeOracle(xml2);
                const chunks2 = splitIntoChunks(escaped2, size);
                lines.push(...generateClobChunks('v_DS_PERSIST_LAYOUT_CTC', chunks2, '    '));
                lines.push('');
            }

            lines.push(`    INSERT INTO FD (`);
            lines.push(`        IDFD,`);
            lines.push(`        ID_INST,`);
            lines.push(`        ID_TCONFIG,`);
            lines.push(`        NM_FD_CONFIG,`);
            lines.push(`        CD_FD_CONFIG,`);
            lines.push(`        DS_ENT,`);
            lines.push(`        DS_PERS,`);
            lines.push(`        CD_STAT,`);
            lines.push(`        IN_VIS,`);
            lines.push(`        QT_DAYS`);
            lines.push(`    )`);
            lines.push(`    SELECT`);
            lines.push(`        SEQUENCE.NEXTVAL,`);
            lines.push(`        (SELECT ID_INST FROM INST WHERE NM_CURTO = '${escapeOracle(abrev)}'),`);
            lines.push(`        (SELECT ID_TCONFIG FROM TCONFIG WHERE NM_TCONFIG = '${escapeOracle(tconfig)}'),`);
            lines.push(`        '${escapeOracle(nome)}',`);
            lines.push(`        '${escapeOracle(codigo)}',`);
            lines.push(`        ${hasXml1 ? 'v_DS_CONTENT_LAYOUT_CTC' : 'NULL'},`);
            lines.push(`        ${hasXml2 ? 'v_DS_PERSIST_LAYOUT_CTC' : 'NULL'},`);
            lines.push(`        'A',`);
            lines.push(`        1,`);
            lines.push(`        NULL`);
            lines.push(`    FROM DUAL`);
            lines.push(`    WHERE NOT EXISTS (`);
            lines.push(`        SELECT IDFD`);
            lines.push(`        FROM FD_CONFIG`);
            lines.push(`        WHERE ID_INST = (SELECT ID_INST FROM INST WHERE NM_CURTO = '${escapeOracle(abrev)}')`);
            lines.push(`        AND CD_FD_CONFIG = '${escapeOracle(codigo)}'`);
            lines.push(`    );`);

            lines.push('');
            vars.forEach(v => lines.push(`    DBMS_LOB.FREETEMPORARY(${v});`));
            lines.push('    COMMIT;');
            lines.push('END;');
            lines.push('/');

            const totalChunks = (hasXml1 ? splitIntoChunks(escapeOracle(xml1), size).length : 0)
                + (hasXml2 ? splitIntoChunks(escapeOracle(xml2), size).length : 0);

            results.push({
                name: `SQL_GERADO - Conjunto ${num} (${codigo})`,
                sql: lines.join('\n'),
                chunks: totalChunks,
                chars: xml1.length + xml2.length
            });
        }

        if (results.length === 0) {
            alert('Adicione pelo menos um conjunto FD.');
            return;
        }

        renderResults(results, 'FD');
    }

    // ========== EV ==========
    function generateEV(size) {
        const slots = evSlots.querySelectorAll('.ev-item');
        const results = [];

        for (let i = 0; i < slots.length; i++) {
            const num = i + 1;
            const nm = document.getElementById(`evNm_${num}`).value.trim();
            const ds = document.getElementById(`evDs_${num}`).value.trim();
            const textarea = slots[i].querySelector('textarea');
            const xml = textarea.value;

            if (!xml) continue;
            if (!nm) { alert(`XML_${num}: Informe o Nome.`); return; }
            if (!ds) { alert(`XML_${num}: Informe a Descricao.`); return; }

            const escapedXml = escapeOracle(xml);
            const chunks = splitIntoChunks(escapedXml, size);

            const header = generateHeader([
                { name: 'v_var1', value: nm },
                { name: 'v_var2', value: ds }
            ]);

            const lines = [...header];
            lines.push('DECLARE');
            lines.push('    v_CLOB CLOB;');
            lines.push('BEGIN');
            lines.push('    DBMS_LOB.CREATETEMPORARY(v_CLOB, TRUE);');
            lines.push('');
            lines.push(...generateClobChunks('v_CLOB', chunks, '    '));
            lines.push('');

            lines.push(`    INSERT INTO ENRICH (`);
            lines.push(`        ID,`);
            lines.push(`        NM,`);
            lines.push(`        DS,`);
            lines.push(`        DS_CONTENT,`);
            lines.push(`        CD_STAT`);
            lines.push(`    )`);
            lines.push(`    SELECT`);
            lines.push(`        SEQUENCE.NEXTVAL,`);
            lines.push(`        '${escapeOracle(nm)}',`);
            lines.push(`        '${escapeOracle(ds)}',`);
            lines.push(`        v_CLOB,`);
            lines.push(`        'A'`);
            lines.push(`    FROM DUAL`);
            lines.push(`    WHERE NOT EXISTS (`);
            lines.push(`        SELECT ID`);
            lines.push(`        FROM ENRICH`);
            lines.push(`        WHERE DS = '${escapeOracle(ds)}'`);
            lines.push(`        AND CD_STAT = 'A'`);
            lines.push(`    );`);

            lines.push('');
            lines.push('    DBMS_LOB.FREETEMPORARY(v_CLOB);');
            lines.push('    COMMIT;');
            lines.push('END;');
            lines.push('/');

            results.push({
                name: `SQL_GERADO - XML_${num} (${nm})`,
                sql: lines.join('\n'),
                chunks: chunks.length,
                chars: xml.length
            });
        }

        if (results.length === 0) {
            alert('Informe pelo menos um XML.');
            return;
        }

        renderResults(results, 'EV');
    }

    // ========== Renderizar resultados (FD e EV) ==========
    function renderResults(results, type) {
        // Botoes globais se mais de 1
        if (results.length > 1) {
            const globalActions = document.createElement('div');
            globalActions.className = 'output-global-actions';
            globalActions.innerHTML = `
                <button type="button" id="btnCopyAll">Copiar todos os SQLs</button>
                <button type="button" id="btnDownloadAll">Baixar todos (.sql)</button>
            `;
            outputContainer.appendChild(globalActions);

            document.getElementById('btnCopyAll').addEventListener('click', () => {
                const allText = results.map(r => `-- ========== ${r.name} ==========\n${r.sql}`).join('\n\n');
                copyToClipboard(allText, document.getElementById('btnCopyAll'));
            });

            document.getElementById('btnDownloadAll').addEventListener('click', () => {
                const allText = results.map(r => `-- ========== ${r.name} ==========\n${r.sql}`).join('\n\n');
                downloadFile(`${type}_todos.sql`, allText);
            });
        }

        results.forEach((r) => {
            const section = document.createElement('section');
            section.className = 'output-section';
            section.innerHTML = `
                <div class="output-header">
                    <h2>${escapeHtml(r.name)}</h2>
                    <div class="output-actions">
                        <span class="sql-info">${r.chunks} chunk(s) | ${r.chars.toLocaleString('pt-BR')} caracteres</span>
                        <button type="button" class="btn-copy-single">Copiar</button>
                        <button type="button" class="btn-download-single">Baixar .sql</button>
                    </div>
                </div>
                <pre class="sql-output"><code></code></pre>
            `;
            section.querySelector('code').textContent = r.sql;
            outputContainer.appendChild(section);

            section.querySelector('.btn-copy-single').addEventListener('click', (e) => {
                copyToClipboard(r.sql, e.target);
            });
            section.querySelector('.btn-download-single').addEventListener('click', () => {
                const filename = r.name.replace(/[^a-zA-Z0-9_-]/g, '_') + '.sql';
                downloadFile(filename, r.sql);
            });
        });

        outputContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // ========== Utils ==========
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function copyToClipboard(text, btn) {
        navigator.clipboard.writeText(text).then(() => {
            const original = btn.textContent;
            btn.textContent = 'Copiado!';
            setTimeout(() => { btn.textContent = original; }, 2000);
        });
    }

    function downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});
