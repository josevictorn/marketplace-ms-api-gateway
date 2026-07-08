# Marketplace - API Gateway 🚀

Bem-vindo ao **API Gateway** do projeto Marketplace. Este serviço é a porta de entrada principal para nossa arquitetura de microsserviços, desenvolvida inteiramente do zero para ser robusta, escalável e resiliente.

## 📖 Sobre o Projeto

O API Gateway atua como um ponto único de entrada (Single Point of Entry) para todas as requisições de clientes (seja front-end web, aplicativos móveis ou integrações de terceiros), roteando-as de forma inteligente para os microsserviços apropriados no backend. 

Além de simplificar a comunicação do cliente com o ecossistema de microsserviços, o Gateway centraliza responsabilidades críticas, fornecendo uma camada de resiliência para proteger a infraestrutura contra falhas.

## 🛠️ Tecnologias Utilizadas

As principais tecnologias e ferramentas que compõem a base deste serviço incluem:

- **[Node.js](https://nodejs.org/):** Ambiente de execução JavaScript server-side de alta performance, ideal para I/O não bloqueante.
- **[NestJS](https://nestjs.com/):** Framework Node.js progressivo para a construção de aplicações eficientes, confiáveis e escaláveis, utilizando uma arquitetura modular.
- **[TypeScript](https://www.typescriptlang.org/):** Superconjunto de JavaScript que adiciona tipagem estática, garantindo um código mais seguro e de fácil manutenção.

## 🧠 Conceitos Avançados Aplicados

Para garantir que a comunicação do API Gateway com os microsserviços seja extremamente resiliente e não sofra com falhas em cascata, implementamos os seguintes padrões arquiteturais avançados:

- **Comunicação Assíncrona (Proxy):** Configuração de proxy reverso otimizada para integração transparente e de alta performance entre os serviços.
- **Circuit Breaker:** Mecanismo de defesa que previne falhas em cascata. Ele monitora a taxa de erro nas chamadas a um microsserviço e, ao atingir um limite, "abre o circuito", interrompendo temporariamente as requisições e permitindo que o serviço degradado se recupere.
- **Retry (Tentativas Automáticas):** Implementação de tentativas de reexecução para requisições que falharam devido a problemas transientes (como oscilações temporárias de rede).
- **Fallback (Respostas de Contingência):** Fornecimento de respostas alternativas amigáveis ou dados em cache quando um serviço falha definitivamente ou quando o Circuit Breaker está acionado, garantindo a continuidade do serviço para o usuário.
- **Timeout:** Controle rigoroso de tempo máximo de espera por respostas de serviços externos. Impede que o Gateway fique com recursos travados aguardando respostas de serviços lentos ou inoperantes.
- **Health Checks:** Rotinas de monitoramento contínuo para verificar a saúde (status operacional) e a disponibilidade tanto do próprio API Gateway quanto de suas dependências vitais.
- **Logs Estruturados:** Sistema de logging abrangente para facilitar o *tracing* (rastreamento) das requisições, monitoramento da saúde da aplicação e diagnóstico ágil de problemas em produção.

## ⚙️ Instalação e Configuração

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- NPM (ou Yarn/PNPM)

### Passos para Inicialização

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/josevictorn/marketplace-ms-api-gateway.git
   cd marketplace-ms/api-gateway
   ```

2. **Instale as dependências do projeto:**
   ```bash
   npm install
   ```

3. **Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto. Você pode usar um arquivo `.env.example` como base (se disponível) e configurar as variáveis essenciais, como a porta em que o servidor irá rodar e as URLs de destino dos microsserviços.

### Executando a Aplicação

Para iniciar o servidor, utilize um dos comandos abaixo:

```bash
# Modo de desenvolvimento padrão
$ npm run start

# Modo de desenvolvimento com live-reload (Recomendado)
$ npm run start:dev

# Modo de produção (compila o TypeScript e roda o bundle)
$ npm run build
$ npm run start:prod
```

## 🧪 Testes

O projeto já vem configurado com ferramentas de teste (Jest). Para executá-los:

```bash
# Executa testes unitários
$ npm run test

# Executa testes ponta a ponta (e2e)
$ npm run test:e2e

# Exibe o relatório de cobertura de código
$ npm run test:cov
```

## ✒️ Autor

- **Nome:** José Victor do Nascimento Ferreira
- **GitHub:** [Meu Perfil do GitHub](https://github.com/josevictorn)
- **LinkedIn:** [Meu Perfil do LinkedIn](https://www.linkedin.com/in/jose-victor-nascimento/)

## 📞 Contato

Para dúvidas, feedbacks ou troca de ideias sobre a arquitetura do projeto:
- **E-mail:** [Meu E-mail](mailto:[josevictornascimento2016@gmail.com])

---
<p align="center">Construído com NestJS 🐈 e muito café ☕.</p>
