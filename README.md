O projeto hidro-alerta é sistema de crowd-sourcing para com o fim de realziar o monitoramento do estado do sistema de distribuição de água na baixada santista.

O sistema foi desenvolvido utilizando supabase com um front-end em react com o build system do vite.

Para incializar o projeto você precisa primeiro clonar-lo com `git clone https://github.com/echovenancio/hidro-alerta.git`
entrar no projeot `cd hidro-alerta`
baixar as dependências `npm install`
incializar o supabase `npx supabase start`
e por fim a aplicação `npm run dev`

Em relação as variáveis de ambiente o frontend depende de duas:
`
VITE_SUPABASE_URL=url
VITE_SUPABASE_ANON_KEY=anon-key
`

Alem disso quando rodando o supabase localmente as edge functions requerem duas variáveis de ambiente, sendo elas:
`
SUPABASE_URL=url
SUPABASE_SERVICE_ROLE_KEY=service-key
`
