import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService implements OnModuleInit {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async onModuleInit() {
    const count = await this.postsRepository.count();
    if (count === 0) {
      const initialPosts: CreatePostDto[] = [
        {
          title:
            'Educação Financeira no Ensino Médio: Como Planejar o Futuro Desde Cedo',
          author: 'professor',
          content: `A educação financeira tornou-se um dos pilares mais importantes na formação dos estudantes do Ensino Médio da rede pública. Durante muitos anos, o ensino da matemática esteve concentrado quase exclusivamente em fórmulas abstratas, deixando de lado aplicações práticas fundamentais para a vida adulta, como o controle do orçamento familiar, o funcionamento dos juros compostos e o planejamento de metas de curto, médio e longo prazo. Quando trazemos esses conceitos para a realidade da sala de aula, os alunos passam a enxergar a matemática como uma ferramenta viva de transformação social e autonomia pessoal.\n\nAo longo deste bimestre, desenvolvemos na escola um projeto interdisciplinar envolvendo Matemática, Sociologia e Língua Portuguesa. O objetivo principal foi permitir que cada turma simulasse a gestão financeira de uma residência real, considerando despesas fixas como moradia, alimentação, transporte e energia elétrica, além de despesas variáveis e reservas para imprevistos. Os estudantes pesquisaram preços em mercados locais, compararam tarifas bancárias e analisaram o impacto do parcelamento no cartão de crédito quando há cobrança de juros rotativos. Essa atividade prática despertou debates riquíssimos sobre consumo consciente e a influência da publicidade nas decisões de compra dos jovens.\n\nOutro ponto central abordado nas aulas foi a diferença entre poupar e investir. Muitos alunos acreditavam que guardar dinheiro exigia grandes quantias mensais, mas demonstramos por meio de tabelas e gráficos construídos em sala que a constância e o tempo são os maiores aliados na formação de uma reserva de segurança. Estudamos indicadores básicos da economia brasileira, como a taxa Selic e a inflação medida pelo IPCA, compreendendo como o poder de compra da moeda varia ao longo dos anos e por que é essencial buscar rendimentos que superem a inflação.\n\nPara encerrar o ciclo de atividades, os estudantes elaboraram guias práticos de bolso voltados às suas próprias famílias, compartilhando dicas simples para evitar o endividamento e organizar as contas mensais em cadernos ou planilhas gratuitas no celular. O resultado superou todas as expectativas pedagógicas: além de melhorar significativamente o desempenho nas avaliações de porcentagem e funções exponenciais, o projeto fortaleceu o vínculo entre a escola e a comunidade escolar, provando que o conhecimento acadêmico ganha verdadeiro sentido quando ajuda a construir cidadãos mais preparados, críticos e conscientes de suas escolhas financeiras.`,
        },
        {
          title:
            'Horta Escolar e Sustentabilidade: Aprendendo Biologia na Prática',
          author: 'professor',
          content: `Transformar um espaço ocioso do pátio da escola em uma horta pedagógica sustentável é uma das experiências mais enriquecedoras que podemos proporcionar aos estudantes do Ensino Fundamental e Médio. Nas aulas de Biologia e Química, conceitos como ciclo do nitrogênio, fotossíntese, pH do solo, decomposição da matéria orgânica e cadeias alimentares muitas vezes parecem distantes quando apresentados apenas nas páginas do livro didático. No entanto, quando os alunos colocam as mãos na terra e acompanham de perto a germinação das sementes até a colheita, a teoria científica ganha vida diante dos seus olhos.\n\nO nosso projeto começou com o diagnóstico ambiental do terreno da escola e a criação de uma composteira doméstica alimentada pelos próprios resíduos orgânicos gerados no preparo da merenda escolar, como cascas de legumes, frutas e borra de café. Durante quatro semanas, os grupos de alunos monitoraram diariamente a temperatura, a umidade e o processo de bioestabilização do composto, compreendendo o papel essencial dos microrganismos decompositores na reciclagem de nutrientes e na redução do volume de lixo enviado aos aterros sanitários da nossa cidade.\n\nNa etapa seguinte, realizamos testes simples de acidez do solo no laboratório de ciências utilizando extrato de repolho roxo como indicador natural de pH. Com base nos resultados obtidos, os estudantes planejaram quais hortaliças e ervas aromáticas melhor se adaptariam às condições luminosas e climáticas da nossa região, optando pelo cultivo consorciado de alface, couve, cenoura, cebolinha, manjericão e hortelã. Essa técnica agroecológica permitiu observar na prática como determinadas espécies vegetais auxiliam na proteção mútua contra pragas sem a necessidade de utilizar agrotóxicos ou fertilizantes químicos sintéticos.\n\nAlém dos conteúdos curriculares de Ciências da Natureza, a horta escolar promoveu mudanças visíveis nos hábitos alimentares e na convivência coletiva. As hortaliças colhidas passaram a complementar as saladas servidas no refeitório da escola, incentivando o consumo de alimentos frescos e nutritivos. Mais do que ensinar botânica e ecologia, o cuidado diário com os canteiros desenvolveu nos jovens valores essenciais como paciência, responsabilidade compartilhada, respeito aos ciclos da natureza e trabalho em equipe, consolidando a escola como um espaço vivo de educação ambiental e cidadania.`,
        },
        {
          title:
            'Leitura Crítica e Repertório Sociocultural na Redação do ENEM',
          author: 'professor',
          content: `A preparação para a prova de redação do Exame Nacional do Ensino Médio costuma gerar grande ansiedade entre os estudantes do terceiro ano, especialmente no que diz respeito à construção de um repertório sociocultural legítimo, produtivo e articulado ao tema proposto. Em nossas oficinas semanais de Língua Portuguesa e Literatura, temos trabalhado para desconstruir o mito de que uma boa dissertação argumentativa depende da memorização mecânica de citações genéricas. Pelo contrário, escrever com autoria exige leitura crítica do mundo, domínio da estrutura textual e capacidade de relacionar diferentes áreas do conhecimento às problemáticas sociais brasileiras.\n\nPara desenvolver essa competência em sala de aula, adotamos a metodologia de rodas de leitura e debates temáticos quinzenais. A cada encontro, selecionamos um eixo estruturante — como saúde pública, direito à educação, preservação ambiental, segurança alimentar ou impactos da tecnologia no trabalho — e analisamos como esse assunto é retratado em diferentes gêneros textuais. Lemos desde reportagens jornalísticas e dados estatísticos do IBGE até contos de Machado de Assis, poemas de Carlos Drummond de Andrade, obras de Carolina Maria de Jesus e capítulos da Constituição Federal de 1988.\n\nEsse exercício comparativo mostra aos estudantes que a literatura brasileira e a história do nosso país oferecem um acervo extraordinário para fundamentar argumentos com profundidade. Quando um aluno compreende o contexto histórico de "Quarto de Despejo" ou de "Vidas Secas", ele deixa de apenas repetir uma frase decorada e passa a analisar as raízes históricas da desigualdade social e da invisibilidade de populações vulneráveis. Em seguida, praticamos o planejamento textual por meio de projetos de texto claros, garantindo que cada parágrafo apresente um tópico frasal bem definido, a fundamentação teórica e a reflexão crítica que conecta o argumento à tese central.\n\nOutro diferencial importante das nossas aulas tem sido a reescrita orientada e colaborativa. Após a correção detalhada baseada nas cinco competências avaliadas pelo exame, os alunos revisam suas próprias produções identificando desvios gramaticais, falhas de coesão referencial e lacunas na proposta de intervenção. Ao compreenderem que a escrita é um processo contínuo de lapidação do pensamento, os estudantes ganham confiança não apenas para alcançar excelentes notas no vestibular, mas também para exercer sua voz cidadã com clareza, ética e empatia.`,
        },
        {
          title:
            'Inteligência Artificial na Escola: Uso Ético e Pensamento Crítico',
          author: 'professor',
          content: `A presença de ferramentas de inteligência artificial generativa no cotidiano dos estudantes já é uma realidade irreversível nas escolas brasileiras. Em vez de simplesmente proibir o acesso às novas tecnologias ou ignorar sua existência, o papel fundamental da educação contemporânea consiste em orientar o uso ético, consciente e crítico desses recursos digitais. Quando bem mediada pelo professor, a tecnologia pode atuar como uma aliada no processo de investigação científica, desde que jamais substitua o esforço intelectual, a leitura aprofundada e o desenvolvimento da autonomia cognitiva do aluno.\n\nNas últimas semanas, promovemos um ciclo de oficinas práticas com as turmas do Ensino Médio para investigar como os modelos de linguagem funcionam e quais são suas principais limitações. Durante a atividade, pedimos que os estudantes formulassem perguntas complexas sobre conteúdos de História do Brasil e Física Clássica para diferentes ferramentas automatizadas e, em seguida, confrontassem as respostas geradas com livros didáticos, artigos acadêmicos e fontes primárias confiáveis. Os próprios alunos identificaram rapidamente casos de informações imprecisas, datas trocadas e referências bibliográficas inexistentes, fenômeno conhecido tecnicamente como alucinação.\n\nEssa descoberta prática em sala de aula foi decisiva para despertar a consciência crítica da turma. Os estudantes perceberam que aceitar qualquer resposta pronta sem checar a veracidade das fontes compromete seriamente a aprendizagem e a formação acadêmica. Discutimos também questões urgentes relacionadas à privacidade de dados pessoais, direitos autorais, vieses algorítmicos e o impacto da desinformação nas redes sociais. Compreender que os algoritmos refletem padrões estatísticos — e não raciocínio humano ou compromisso com a verdade — mudou completamente a postura dos jovens diante das telas.\n\nComo resultado do projeto, construímos coletivamente um guia de boas práticas digitais para os trabalhos escolares do semestre. Ficou estabelecido que recursos tecnológicos podem ser utilizados para organizar cronogramas de estudo, revisar dúvidas conceituais ou sugerir palavras-chave para pesquisas bibliográficas, mas toda produção textual, resolução de problemas e síntese reflexiva deve ser fruto da compreensão genuína do estudante. Dessa forma, a escola cumpre sua missão formadora ao preparar jovens capazes de dominar a tecnologia com responsabilidade, discernimento e integridade intelectual.`,
        },
        {
          title:
            'Feira de Ciências e Robótica Educacional com Materiais Recicláveis',
          author: 'professor',
          content: `A realização da Feira Anual de Ciências e Tecnologia movimentou todos os corredores e laboratórios da nossa escola nas últimas semanas, demonstrando o enorme potencial criativo dos estudantes quando desafiados a solucionar problemas reais da comunidade. Neste ano, o tema central escolhido pelo corpo docente foi a robótica educacional sustentável e a eficiência energética, propondo a construção de protótipos funcionais a partir do reaproveitamento de componentes eletrônicos descartados, papelão, garrafas plásticas e palitos de madeira.\n\nSob a orientação dos professores de Física e Matemática, as equipes do nono ano e do Ensino Médio aplicaram conceitos de circuitos elétricos em série e em paralelo, conversão de energia, alavancas, pressão hidráulica e programação básica em microcontroladores. Um dos grupos desenvolveu um sistema automatizado de irrigação por gotejamento acionado por sensores de umidade do solo de baixo custo, pensado especificamente para auxiliar na manutenção da horta escolar durante os períodos de recesso e finais de semana. Outro grupo construiu um braço mecânico articulado movido a seringas hidráulicas, explicando de maneira didática e visual o Princípio de Pascal para os visitantes mais novos.\n\nO processo de preparação para a feira exigiu muito mais do que domínio técnico das fórmulas de física. Os alunos precisaram elaborar um diário de bordo científico registrando hipóteses iniciais, falhas encontradas nos primeiros testes, ajustes de projeto e análise de resultados. Aprender a lidar com o erro experimental como parte natural do método científico fortaleceu a resiliência e a capacidade de resolução colaborativa de problemas entre os integrantes de cada equipe.\n\nNo dia da exposição aberta às famílias e moradores do bairro, os próprios estudantes assumiram o protagonismo na apresentação oral dos experimentos, traduzindo termos técnicos para uma linguagem acessível e envolvente. Ver o orgulho nos olhos de cada jovem ao explicar o funcionamento de seu protótipo confirma que a aprendizagem baseada em projetos desperta vocações científicas, aproxima a teoria escolar do mundo concreto e transforma a sala de aula em um verdadeiro laboratório de inovação cidadã.`,
        },
      ];

      await this.postsRepository.save(
        initialPosts.map((p) => this.postsRepository.create(p)),
      );
      console.log('Banco populado com 5 postagens escolares iniciais.');
    }
  }

  async create(
    createPostDto: CreatePostDto,
    user?: { username: string },
  ): Promise<Post> {
    const post = this.postsRepository.create({
      ...createPostDto,
      author: user?.username ?? createPostDto.author,
    });
    return this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post com id ${id} não foi encontrado`);
    }

    return post;
  }

  async search(term: string): Promise<Post[]> {
    if (!term || term.trim().length === 0) {
      return [];
    }

    return this.postsRepository
      .createQueryBuilder('post')
      .where('LOWER(post.title) LIKE LOWER(:term)', { term: `%${term}%` })
      .orWhere('LOWER(post.content) LIKE LOWER(:term)', {
        term: `%${term}%`,
      })
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    user?: { username: string },
  ): Promise<Post> {
    const post = await this.findOne(id);
    this.assertOwner(post, user);
    Object.assign(post, updatePostDto);
    if (user) post.author = user.username;
    return this.postsRepository.save(post);
  }

  async remove(id: number, user?: { username: string }): Promise<void> {
    const post = await this.findOne(id);
    this.assertOwner(post, user);
    await this.postsRepository.remove(post);
  }

  private assertOwner(post: Post, user?: { username: string }): void {
    if (user && post.author !== user.username)
      throw new ForbiddenException(
        'Somente o autor pode alterar esta postagem',
      );
  }
}
