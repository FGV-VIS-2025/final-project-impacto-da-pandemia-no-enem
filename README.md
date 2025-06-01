[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/oHw8ptbv)

# Tarefa 4 de Visualização de Dados
## O Impacto da Pandemia no ENEM
### Autores
- Guilherme Moreira Castilho: @GuilhermeCastilho02
- Paulo César Gomes Rodrigues: @paulocgr9
- Samuel Corrêa Lima: @samullima

### Introdução à tarefa
A tarefa 4 da disciplina de Visualização de Dados do curso de Ciência de Dados e Inteligência Artificial tem como objetivo introduzir os alunos ao desenvolvimento de visualizações interativas e animadas, permitindo também que pensem cuidadosamente
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
pandemia) e em 2020 (contexto durante a pandemia). As análises são focadas somente ao estado de Minas Gerais, principalmente por conta das limitações das ferramentas utilizadas para o trabalho. Dentre todos os estados, Minas Gerais foi escolhido por ser um dos
estados mais influentes do país, sendo o 2º estado com maior população, e por sua grande variedade socioeconômica.

### Bases de Dados
Para o desenvolvimento do trabalho foram utilizados os microdados do ENEM, o qual possui dados de todas as inscrições para a
realização da prova em determinado ano, tais como sexo, raça/cor, faixa etária, estado civil, município, presença nas provas, nota, etc.

Como desejamos analisar o contexto pré e durante a pandemia, utilizamos os **Microdados do Enem 2019** e **Microdados do Enem 2020**. Ambas as bases de dados podem ser acessadas em: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem.

### Ferramentas Utilizadas
Para a limpeza e filtragem dos dados foi utilizada a biblioteca Pandas do Python, que permite facilmente manipular dataframes e
gerar novos para realizar análises mais específicas.

Uma vez com os CSVs prontos, utilizamos a biblioteca D3.js do JavaScript, que é amplamente utilizada no desenvolvimento de visualizações interativas.

### Acesso ao projeto
O resultado final do nosso projeto pode ser encontrado em: https://fgv-vis-2025.github.io/tarefa-4-impacto_da_pandemia_no_enem/

A página contém: 
* Introdução: Uma breve introdução acerca do trabalho e como utilizá-las;
* Projeto: Onde é possível visualizar e interagir com as visualização desenvolvidas pelo grupo.
* Autores: Informações para contato de cada um dos alunos envolvidos no projeto.
* GitHub: Acesso à página do trabalho no GitHub.

### Visualizações
Todas as visualizações desenvolvidas podem ser encontradas na aba "Projeto" do nosso site.

A primeira visualização consiste em um mapa interativo do estado de Minas Gerais. O mapa está dividido em mesorregiões. Ao clicar em uma mesorregião, todas as demais visualizações serão automaticamente filtradas para que exibam somente os dados referentes àquela selecionada. Uma vez selecionadas, caso o usuário deseje voltar a visualizar dados do estado inteiro, basta clicar no botão "Remover Filtros" no canto inferior esquerdo do mapa.

A segunda visualização consiste em um gráfico de barras que, a princípio, exibe a quantidade de inscrições ocorridas no estado de Minas Gerais em 2019 e 2020. Próximo ao gráfico, há um botão que permite ao usuário selecionar uma variável para ser visualizada. As variáveis disponíveis para seleção são:

* Cor ou Raça
* Estado civil
* Faixa etária
* Localização da escola
* Possui internet
* Celulares na residência
* Computadores na residência
* Renda
* Sexo
* Tipo de escola

Ao selecionar uma variável, o gráfico de barras será atualizado para exibir a quantidade de inscrições ocorridas em 2019 e 2020 para cada categoria da variável selecionada, formando um gráfico de barras agrupadas. Também é possível visualizar somente uma categoria específica da variável selecionada. Para isso, basta clicar na barra ou no item da legenda correspondente à categoria desejada.

A terceira visualização consiste em um boxplot que exibe as taxas médias por cidade de presença dos alunos nas provas do ENEM 2019 e 2020. Ao selecionar uma mesorregião no mapa, o boxplot será filtrado para exibir dados somente das cidades daquela mesorregião.

A quarta e última visualização consiste em um heatmap. A princípio, o heatmap exibe a quantidade total de inscrições ocorridas no estado de Minas Gerais em cada ano. O usuário poderá, então, selecionar duas variáveis, uma para o eixo X e outra para o eixo Y, tendo acesso a análises cruzadas mais detalhadas para obter visões mais abrangentes. O heatmap passará a exibir a quantidade de inscrições ocorridas para cada combinação de variáveis selecionadas. As variáveis disponíveis para seleção são:

* Cor ou Raça
* Estado civil
* Faixa etária
* Localização da escola
* Possui internet
* Celulares na residência
* Computadores na residência
* Renda
* Sexo
* Tipo de escola

### Justificativas
#### Gráfico de mapa
Decidimos que um filtro para regiões através de um mapa ao invés de uma lista seria mais intuitivo, visto que dá ao usuário uma
percepção visual de qual região do estado ele está selecionando. Após sugestões recebidas com a apresentação do MVP, decidimos que
seria melhor deixar o mapa fixo ao lado dos outros gráficos, permitindo que os filtros sejam aplicados sem a necessidade de 
navegar até o topo da página.

#### Gráfico de barras
O gráfico tem como propósito permitir que o usuário analise facilmente a quantidade de pessoas que se inscreveram para o ENEM dado
alguma variável decidida pelo usuário. Consideramos a possibilidade de que o gráfico fosse de barras empilhadas ao invés de 
barras agrupadas, porém decidimos que agrupadas seria melhor por facilitar comparações entre o tamanho das barras.

#### Boxplot
Apesar das inscrições serem um fator importante, outro que devemos levar em consideração é se os inscritos realmente foram
realizar a prova. Utilizamos as colunas de presença para cada prova dos dados e consideramos que, caso o aluno não estivesse 
presente para uma das 4 provas, ele não estaria presente no ENEM. Calculamos então a média de presença para cada município, o que 
serve como base para a construção do boxplot que também pode ser filtrado de acordo com as regiões.

A escolha de um boxplot para representar essa informação se deve a facilidade de perceber visualmente uma queda forte na presença de um ano para o outro. 

Uma alternativa que pensamos para este gráfico seria um gráfico de violino, mas o mesmo não ficaria tão bom quanto o boxplot para
representar pontos específicos, tais como os outliers e quantis.

#### Heatmap
Gostaríamos de dar a opção ao usuário de visualizar a quantidade de inscrições por uma combinação de variáveis por permitir que
certos padrões sejam identificados. Por exemplo: é esperado inscritos que não possuem computador em casa e possuem uma renda
baixa tenham tido uma queda de inscrições mais acentuada do que pessoas de renda alta e com computadores.

O melhor tipo de visualização que pensamos para visualizar essa ideia foi a de utilizar heatmaps. Para representar as quantidades
utilizamos uma escala contínua de tons de azul. Até a apresentação do MVP, essa escala iniciava em branco, porém, após relatos de 
ser difícil identificar as caixas perante ao fundo no tema claro, optamos por fazer com que a escala de cores começasse em um tom 
de azul claro.

Uma alternativa para o heatmap que pensamos foi de haver um *toggle* para alterar entre os dados de 2019 e 2020, porém decidimos 
que é importante que ambas possam ser vistos ao mesmo tempo e com a mesma escala de cores para que as mudanças sejam mais
facilmente percebidas.

### Divisão de Trabalho e tempo gasto
Paulo César Gomes Rodrigues - @paulocgr9
- Limpeza dos dados - 2h
- Implementação do heatmap interativo - 12h
- Textos das páginas - 1h

Guilherme Moreira Castilho - @GuilhermeCastilho02
- Desenvolvimento do mapa interativo - 8h
- Implementação do gráfico de barras interativo - 12h

Samuel Corrêa Lima - @samullima
- Desenvolvimento dos HTMLs e CSS - 7h
- Implementação do boxplot interativo - 8h
- Análise da média de desistências das cidades por região - 10min

Além disso, todos os membros contribuíram para otimizações em todas as partes do trabalho, tais como deixar as visualizações mais 
fluídas, alterações estéticas, etc. Todos também auxiliaram na solução de problemas pontuais em todas as visualizações.

### Uso de Inteligência Artificial
Ferramentas de inteligência artificial foram utilizadas majoritariamente para pesquisa, a fim de entender de maneira rápida como
realizar certas ações utilizando a linguagem JavaScript e a biblioteca D3 como qual parâmetro deveria ser alterarado para 
selecionar uma paleta de cores para um gráfico, ou para encontrar rapidamente erros de implementação.