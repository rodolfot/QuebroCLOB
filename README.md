# QuebraCLOB

Ferramenta web para gerar comandos SQL Oracle compatíveis com campos CLOB a partir de XMLs grandes (200.000+ caracteres).

## Problema

O Oracle limita literais de string (`VARCHAR2`) a 4.000 caracteres em comandos SQL. Para persistir XMLs grandes em um campo CLOB, é necessário quebrar o conteúdo em pedaços e usar `DBMS_LOB.APPEND` para montar o valor completo.

## Como funciona

1. Cole ou carregue o XML de entrada
2. Informe o nome da tabela
3. Escolha a operação: **INSERT** ou **UPDATE**
4. Clique em **Gerar SQL**

A ferramenta gera automaticamente um bloco PL/SQL que:
- Cria um CLOB temporário
- Quebra o XML em chunks de até 4.000 caracteres (configurável)
- Escapa aspas simples para compatibilidade com Oracle
- Monta o CLOB usando `DBMS_LOB.APPEND`
- Executa o INSERT ou UPDATE na tabela informada no campo `ds_content`
- Libera o CLOB temporário e faz COMMIT

## Exemplo de saída

```sql
DECLARE
    v_clob CLOB;
BEGIN
    DBMS_LOB.CREATETEMPORARY(v_clob, TRUE);

    v_clob := TO_CLOB('<?xml version="1.0"?><root>...');
    DBMS_LOB.APPEND(v_clob, TO_CLOB('<item>...</item>...'));
    -- ... demais chunks

    INSERT INTO TB_DOCUMENTO (ds_content)
    VALUES (v_clob);

    DBMS_LOB.FREETEMPORARY(v_clob);
    COMMIT;
END;
/
```

## Como usar

Abra o arquivo `index.html` diretamente no navegador. Não requer servidor, instalação ou dependências.

## Tecnologias

- HTML, CSS e JavaScript puro
- Sem dependências externas
