# SPEC: Instrumentação de Métricas HTTP com Prometheus no API Gateway

## Contexto
O API Gateway precisa expor um endpoint `GET /metrics` contendo métricas no formato do Prometheus. Atualmente, o Prometheus já está configurado na `observability-stack` para fazer o scrape deste endpoint a cada 15 segundos, mas o target está "down" pois a rota ainda não existe.

Esta spec define a criação de um módulo global de métricas usando a biblioteca `prom-client` para expor métricas padrão do Node.js e métricas HTTP customizadas (contador de requisições e histograma de duração). O API Gateway centraliza as requisições, tornando essas métricas essenciais.

## 1. Dependências
Instalar a biblioteca oficial do Prometheus para Node.js:
```bash
npm install prom-client
```

## 2. Implementação do MetricsModule

Criar um módulo global `@Global()` chamado `MetricsModule` na pasta `src/metrics/`.

### 2.1. MetricsService (`src/metrics/metrics.service.ts`)
Criar o serviço responsável por gerenciar o registry e as métricas.

**Requisitos:**
- Inicializar `promClient.collectDefaultMetrics()` no construtor.
- Definir um `Counter` chamado `http_requests_total` com as labels: `['method', 'route', 'status_code']`.
- Definir um `Histogram` chamado `http_request_duration_seconds` com as labels: `['method', 'route', 'status_code']` e buckets adequados (ex: `[0.1, 0.3, 0.5, 1, 1.5, 2, 5, 10]`).
- O método `getMetrics()` deve retornar as métricas do registry (via `promClient.register.metrics()`).
- Ter métodos auxiliares para atualizar o histograma e contador após o fim da requisição.

### 2.2. HttpMetricsInterceptor (`src/metrics/http-metrics.interceptor.ts`)
Criar um interceptor para capturar as requisições HTTP e registrar duração/status.

**Requisitos:**
- Implementar a interface `NestInterceptor`.
- Injetar o `MetricsService`.
- No método `intercept`, capturar o instante inicial (`Date.now()`).
- Utilizar os operadores do RxJS (como `tap`) para capturar o `statusCode` na resposta, o `method` e o path (`route`) da request.
- **Importante:** Ignorar as requisições cujo caminho seja `/metrics` ou `/health`, para não poluir as métricas de negócio e evitar loop de coleta.
- Chamar o `MetricsService` passando os labels coletados e a duração da requisição em segundos.

**Registro:**
Registrar o interceptor globalmente no `MetricsModule`:
```typescript
{
  provide: APP_INTERCEPTOR,
  useClass: HttpMetricsInterceptor,
}
```

### 2.3. MetricsController (`src/metrics/metrics.controller.ts`)
Criar o controller do endpoint HTTP das métricas.

**Requisitos:**
- Definir a rota `GET /metrics`.
- Retornar o conteúdo do `MetricsService.getMetrics()`.
- Definir o `Content-Type` do cabeçalho de resposta utilizando `promClient.register.contentType`.
- **Autenticação no API Gateway:** A rota não deve exigir token JWT. Como o Gateway utiliza o `JwtAuthGuard` global, você deve utilizar o decorator `@SetMetadata('isPublic', true)` (ou um custom decorator equivalente, se já existir) para indicar que a rota é pública.

### 2.4. MetricsModule (`src/metrics/metrics.module.ts`)
- Utilizar o decorator `@Global()`.
- Providers: `MetricsService` e o registro do `APP_INTERCEPTOR`.
- Controllers: `MetricsController`.
- Exports: `MetricsService`.

## 3. Integração no AppModule
Registrar o `MetricsModule` na lista de imports do `AppModule` em `src/app.module.ts`.

## 4. Métricas Expostas

| Nome da Métrica | Tipo | Labels | Descrição |
| :--- | :--- | :--- | :--- |
| `http_requests_total` | Counter | `method`, `route`, `status_code` | Total de requisições recebidas pelo gateway |
| `http_request_duration_seconds` | Histogram | `method`, `route`, `status_code` | Duração das requisições em segundos |
| *(Default)* | Vários | Vários | Métricas padrão do Node.js (`process_cpu_seconds_total`, `nodejs_heap_space_size_bytes`, etc) |

## 5. Critérios de Aceite
1. O pacote `prom-client` deve estar instalado nas dependências.
2. O endpoint `GET /metrics` deve retornar HTTP 200 com os dados do Prometheus e com `Content-Type: text/plain; version=0.0.4; charset=utf-8`.
3. A rota `/metrics` deve ser acessível publicamente (sem Bearer token).
4. O acesso à rota `/metrics` não deve gerar incrementos em `http_requests_total`.
5. Os dados do `http_requests_total` e `http_request_duration_seconds` devem constar no retorno da rota com suas respectivas labels.
6. As métricas do Node.js também devem estar visíveis.
7. O Prometheus da `observability-stack` deve indicar o target `api-gateway` (porta 3005) como **UP**.
