[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/oHw8ptbv)

Esse trabalho é uma continuação de https://github.com/FGV-VIS-2025/tarefa-4-impacto_da_pandemia_no_enem

# Tarefa 4 de Visualização de Dados
## O Impacto da Pandemia no ENEM
### Autores
- Guilherme Moreira Castilho: @GuilhermeCastilho02
- Paulo César Gomes Rodrigues: @paulocgr9
- Samuel Corrêa Lima: @samullima

### Introdução à tarefa
O projeto final da disciplina de Visualização de Dados do curso de Ciência de Dados e Inteligência Artificial tem como objetivo introduzir os alunos ao desenvolvimento de visualizações interativas e animadas, permitindo também que pensem cuidadosamente
sobre a eficácia de determinadas técnicas para a transmissão de informação.

### Introdução ao tema da tarefa
A pandemia de COVID-19 chegou ao Brasil no início de 2020 e trouxe consigo diversos desafios, especialmente para a educação.
Com as escolas fechadas e a implementação do ensino remoto, o acesso à educação se tornou ainda mais desigual. Muitos estudantes
deixaram de frequentar as aulas e tiveram suas vidas impactadas pela incerteza.

O Exame Nacional do Ensino Médio (ENEM) é uma prova realizada anualmente e tem como uma de suas principais funções permitir o 
acesso dos alunos ao ensino superior. A sua edição de 2020 (realizada em 17 e 24 de janeiro de 2021) foi marcada por debates 
acerca da dificuldade de acesso a uma rotina eficiente de preparação para a prova por pessoas sem acesso à internet ou
dispositivos para utilizá-la.

Tendo isso em vista, decidimos analisar as diferenças entre os alunos que realizaram o ENEM nas edições de 2019 (contexto pré-
pandemia) a 2023 (contexto durante e pós pandemia). As análises são focadas somente ao estado de Minas Gerais, principalmente por conta das limitações das ferramentas utilizadas para o trabalho.

### Bases de Dados
Para o desenvolvimento do trabalho foram utilizados os microdados do ENEM, o qual possui dados de todas as inscrições para a
realização da prova em determinado ano, tais como sexo, raça/cor, faixa etária, estado civil, município, presença nas provas, nota, etc.

Como desejamos analisar o contexto pré e durante a pandemia, utilizamos os **Microdados do Enem** de 2019 a 2023. Todas as bases de dados podem ser acessadas em: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem.

### Ferramentas Utilizadas
Para a limpeza e filtragem dos dados foi utilizada a biblioteca Pandas do Python, que permite facilmente manipular dataframes e
gerar novos para realizar análises mais específicas.

Uma vez com os CSVs prontos, utilizamos a biblioteca D3.js do JavaScript, que é amplamente utilizada no desenvolvimento de visualizações interativas.

### Acesso ao projeto
O resultado final do nosso projeto pode ser encontrado em: https://fgv-vis-2025.github.io/final-project-impacto-da-pandemia-no-enem/

### Visualizações
Todas as visualizações desenvolvidas podem ser encontradas na aba "Projeto Antigo" e "Projeto" do nosso site.
Como esse trabalho trata-se de uma sequência de um projeto anterior, a aba "Projeto Antigo" contém as visualizações
projetadas anteriormente visando somente o estado de Minas Gerais e os anos de 2019 e 2020. Enquanto isso,
a aba "Projeto" contém as visualizações atualizadas, referindo-se ao Brasil inteiro e aos anos de 2019 a
2023.

A primeira visualização consiste em um mapa interativo do Brasil. O mapa está dividido em
estados. Ao clicar em um estado, todas as demais visualizações serão automaticamente filtradas
para que exibam somente os dados referentes àquele selecionado. Uma vez selecionados, caso o usuário deseje
voltar a visualizar dados do país inteiro, basta clicar no botão "Remover Filtros" no canto inferior esquerdo
do mapa.

A segunda visualização consiste em um gráfico de barras que, a princípio, exibe a quantidade de inscrições
ocorridas
no Brasil entre 2019 e 2023. Próximo ao gráfico, há um botão que permite ao usuário selecionar uma
variável para ser visualizada. As variáveis disponíveis para seleção são:

* Cor ou Raça
* Estado civil
* Faixa etária
* Possui internet
* Celulares na residência
* Computadores na residência
* Renda
* Sexo
* Tipo de escola

A terceira visualização consiste em um heatmap. A princípio, o heatmap está vazio. O usuário poderá, então,
selecionar duas variáveis, uma para o eixo X e outra para o eixo Y, tendo acesso a análises cruzadas mais
detalhadas
para obter visões mais abrangentes.

A terceira e última visualização consiste em um mapa de bolhas, que exibe a quantidade de
inscrições ocorridas em cada estado do Brasil. Ao passar o mouse sobre uma bolha, o usuário
poderá visualizar a quantidade de inscrições ocorridas naquele estado no ano selecionado.

Ao seu lado, há um boxplot de taxas de presença por município de cada estado brasileiro.
Por meio do mapa, é possível selecionar estados de modo que o boxplot só exibirá dados
para os estados selecionados.

### Divisão de Trabalho e tempo gasto
Paulo César Gomes Rodrigues - @paulocgr9
- Tratamento dos dados - 10h
- Conversão de gráficos antigos para os dados novos - 10h
- Reestruturação da página - 4h
- Desenvolvimento do relatório - 5h

Guilherme Moreira Castilho - @GuilhermeCastilho02
- Modularização - 6h
- Ajustando CSVs - 1h
- Atualizando o dashboard - 8h
- ajustando filtro na pagina map-bubble - 4h
- flowChart + integração- 12h
- Ajustes no heatMap - 2h
- Ajustes na pagina principal - 2h
- Ajustes de dimensões - 4h

Samuel Corrêa Lima - @samullima
- Implementação da página do Mapa de Bolhas - 1h
- Criação do Mapa de Bolhas e suas interatividades - 12h
- Criação do gráfico de boxplots e suas interatividades - 10h
- README - 1h

Além disso, todos os membros contribuíram para otimizações em todas as partes do trabalho, tais como deixar as visualizações mais 
fluídas, alterações estéticas, etc. Todos também auxiliaram na solução de problemas pontuais em todas as visualizações.

### Uso de Inteligência Artificial
Ferramentas de inteligência artificial foram utilizadas majoritariamente para pesquisa, a fim de entender de maneira rápida como
realizar certas ações utilizando a linguagem JavaScript e a biblioteca D3 como qual parâmetro deveria ser alterarado para 
selecionar uma paleta de cores para um gráfico, ou para encontrar rapidamente erros de implementação.

### Link do vídeo
https://www.youtube.com/watch?v=j326YK2LVbY
