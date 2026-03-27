# QuebraCLOB

Ferramenta web para gerar comandos SQL Oracle (PL/SQL) a partir de XMLs grandes, compatíveis com campos CLOB.

## Problema

O Oracle limita literais de string a 4.000 caracteres em comandos SQL. Para persistir XMLs com centenas de milhares de caracteres em campos CLOB, é necessário quebrar o conteúdo em pedaços e montá-lo usando `DBMS_LOB.APPEND`.

## Como usar

Abra o arquivo `index.html` no navegador. Não requer servidor, instalação ou dependências externas.

## Funcionalidades

### Conexão (campos globais)

Campos de preenchimento global que se aplicam a todos os SQLs gerados (FD e EV):

- **Usuario** - usuário de conexão ao banco
- **Senha** - senha de conexão
- **Banco** - string de conexão do banco

Se deixados vazios, usam variáveis de substituição SQL*Plus (`&usuario`, `&senha`, `&BANCO`).

### Dois modos de operação

| Modo | Descrição | XMLs por conjunto |
|------|-----------|-------------------|
| **FD** | Gera INSERT com dois campos CLOB (layout + persistência) | Até 2 por conjunto |
| **EV** | Gera INSERT com um campo CLOB (conteúdo) | Até 7 individuais |

### Modo FD

- Permite criar **vários conjuntos** de uma só vez
- Cada conjunto possui 4 campos: **Abreviação**, **Nome**, **Código** e **Tabela**
- Cada conjunto aceita até **2 XMLs** (XML_1 e XML_2)
- Gera um bloco PL/SQL por conjunto com INSERT...SELECT...FROM DUAL WHERE NOT EXISTS

### Modo EV

- Permite adicionar até **7 XMLs** independentes
- Cada XML possui seus próprios campos: **Nome** e **Descrição**
- Cada XML gera seu próprio bloco PL/SQL com INSERT...SELECT...FROM DUAL WHERE NOT EXISTS

### Tratamento de aspas simples

Aspas simples (`'`) presentes no XML são automaticamente escapadas para `''` (padrão Oracle). O algoritmo de quebra em chunks garante que um par `''` nunca seja partido entre dois pedaços, evitando erros de sintaxe no SQL gerado.

### Tamanho do chunk configurável

- 2.000 caracteres
- 3.000 caracteres
- 4.000 caracteres (padrão, limite máximo do Oracle)

### Exportação

- **Copiar** SQL individual ou todos de uma vez
- **Baixar .sql** individual ou todos em um único arquivo

## Exemplo de saída

Todo arquivo SQL gerado inicia com o cabeçalho de conexão e variáveis:

```sql
-- definir usuario/senha e banco antes de rodar
connect &usuario/&senha@&BANCO

set heading on
set pages 0
set lines 500
set serveroutput on
--show user

-- Variaveis --
DEFINE v_var1 = 'Valor 1'
DEFINE v_var2 = 'Valor 2'
DEFINE v_var3 = 'Valor 3'

DECLARE
    v_CLOB CLOB;
BEGIN
    DBMS_LOB.CREATETEMPORARY(v_CLOB, TRUE);

    v_CLOB := TO_CLOB('<?xml version="1.0"?>...');
    DBMS_LOB.APPEND(v_CLOB, TO_CLOB('<dados>...</dados>'));

    INSERT INTO ... (...)
    SELECT ...
    FROM DUAL
    WHERE NOT EXISTS (...);

    DBMS_LOB.FREETEMPORARY(v_CLOB);
    COMMIT;
END;
/
```

## Estrutura do projeto

```
quebraCLOB/
├── index.html   # Interface principal
├── script.js    # Lógica de quebra, escape e geração SQL
├── style.css    # Estilização (dark theme)
└── README.md    # Este arquivo
```

## Tecnologias

- HTML, CSS e JavaScript puro
- Sem dependências externas
- Roda 100% no navegador (client-side)
