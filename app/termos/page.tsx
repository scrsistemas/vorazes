import Link from "next/link";
import { Section } from "@/components/ui/section";
import {
  LegalHeader,
  LegalList,
  LegalP,
  LegalSection,
} from "@/components/ui/legal";

// RASCUNHO: documento modelo para revisão jurídica. Antes de publicar,
// substitua os campos entre colchetes ([RAZÃO SOCIAL], [CNPJ], [ENDEREÇO
// COMPLETO], [CIDADE/UF]) pelos dados reais da empresa e valide o texto com
// um advogado, especialmente as cláusulas de prazo, cancelamento e
// limitação de responsabilidade.

export const metadata = {
  title: "Termos de uso | Vorazes",
  description:
    "Condições de uso do site e do software Vorazes, incluindo planos, pagamento, licença e suporte.",
};

export default function TermosPage() {
  return (
    <Section className="pt-16">
      <LegalHeader title="Termos de Uso" updatedAt="13 de novembro de 2026" />

      <div className="mt-10 max-w-3xl space-y-10">
        <LegalSection title="1. Quem somos e aceitação">
          <LegalP>
            Estes Termos de Uso regulam o acesso e a utilização do site e do
            software Vorazes, disponibilizados por [RAZÃO SOCIAL], inscrita no
            CNPJ sob o nº [CNPJ], com sede em [ENDEREÇO COMPLETO] (&quot;Vorazes&quot;,
            &quot;nós&quot;).
          </LegalP>
          <LegalP>
            Ao acessar o site, contratar um plano ou utilizar o software, você
            (&quot;Usuário&quot;) declara ter lido e concordado com estes Termos e com
            a{" "}
            <Link href="/privacidade" className="underline hover:text-[var(--text)]">
              Política de Privacidade
            </Link>
            . Caso não concorde, não utilize o serviço.
          </LegalP>
        </LegalSection>

        <LegalSection title="2. Definições">
          <LegalList>
            <li>
              <strong>Site:</strong> as páginas disponibilizadas em [DOMÍNIO],
              incluindo informações sobre o produto, planos, downloads e
              suporte.
            </li>
            <li>
              <strong>Software:</strong> o aplicativo Vorazes para desktop,
              disponibilizado para download após a contratação.
            </li>
            <li>
              <strong>Plano:</strong> a contratação descrita na página{" "}
              <Link href="/planos" className="underline hover:text-[var(--text)]">
                Planos
              </Link>{" "}
              no momento da compra.
            </li>
            <li>
              <strong>Conteúdo:</strong> textos, marcas, identidade visual,
              layout, código e demais materiais do site e do Software.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection title="3. Descrição do serviço">
          <LegalP>
            O Vorazes é um software de apoio ao planejamento e à simulação
            tributária. A partir de dados informados pelo Usuário, o Software
            compara regimes de tributação e apresenta estimativas para apoiar a
            análise de cenários.
          </LegalP>
          <LegalP>
            Os resultados são estimativas geradas com base nas informações
            fornecidas e nas regras tributárias implementadas na versão
            utilizada, e podem variar em razão de alterações na legislação ou de
            particularidades do caso concreto. O Vorazes não presta consultoria
            contábil, tributária, jurídica ou financeira e não substitui a
            análise de profissional habilitado. A decisão final e a
            responsabilidade pelo cumprimento das obrigações legais são do
            Usuário.
          </LegalP>
        </LegalSection>

        <LegalSection title="4. Cadastro e conta">
          <LegalList>
            <li>
              O Usuário deve fornecer informações verdadeiras, exatas e
              atualizadas, como nome e e-mail, e mantê-las atualizadas.
            </li>
            <li>
              O acesso ao Software é vinculado ao e-mail informado no momento da
              contratação. O Usuário é responsável por manter a posse e a
              segurança desse e-mail e por comunicar imediatamente qualquer uso
              indevido.
            </li>
            <li>
              É vedado criar cadastro em nome de terceiros sem autorização ou
              utilizar dados de terceiros sem base legal.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection title="5. Licença de uso e propriedade intelectual">
          <LegalP>
            Durante a vigência do contrato, o Vorazes concede ao Usuário uma
            licença de uso limitada, não exclusiva, intransferível e revogável,
            para uso interno do Usuário e dos colaboradores do escritório ou
            empresa contratante.
          </LegalP>
          <LegalList>
            <li>
              É permitido instalar e utilizar o Software nos dispositivos do
              Usuário ou da organização contratante, nos limites do Plano.
            </li>
            <li>
              É vedado redistribuir, vender, alugar, sublicenciar, modificar,
              copiar (exceto para backup), remover avisos de propriedade ou
              realizar engenharia reversa, salvo nas hipóteses permitidas por
              lei.
            </li>
            <li>
              Marcas, código, layout, textos e demais elementos do site e do
              Software pertencem ao Vorazes ou a seus licenciadores.
            </li>
            <li>
              Os dados que o Usuário insere no Software permanecem de
              titularidade do Usuário, que é responsável pela sua licitude e
              pelo tratamento adequado de dados pessoais de terceiros.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection title="6. Planos, pagamento e prazo">
          <LegalList>
            <li>
              Os planos, valores e condições vigentes são os exibidos na página{" "}
              <Link href="/planos" className="underline hover:text-[var(--text)]">
                Planos
              </Link>{" "}
              no momento da contratação.
            </li>
            <li>
              O contrato tem prazo de 12 (doze) meses contados da confirmação do
              pagamento. Atualmente, a contratação é feita em pagamento único no
              cartão de crédito, com parcelamento em até 12 (doze) vezes sem
              juros.
            </li>
            <li>
              O pagamento é processado pelo PagBank. Os dados do cartão são
              informados diretamente no ambiente do PagBank, não sendo
              armazenados pelo Vorazes.
            </li>
            <li>
              O acesso e o download são liberados somente após a confirmação do
              pagamento. Pagamentos pendentes ou recusados não concedem acesso.
            </li>
            <li>
              Ao final do prazo, o acesso pode ser renovado mediante nova
              contratação, salvo indicação diversa na página de Planos. Não há
              renovação automática sem ação do Usuário.
            </li>
            <li>
              Preços podem ser alterados para novas contratações, sem afetar
              contratos já firmados.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection title="7. Direito de arrependimento e cancelamento">
          <LegalP>
            Nas contratações realizadas fora do estabelecimento comercial, o
            Usuário poderá exercer o direito de arrependimento no prazo de 7
            (sete) dias corridos contados da contratação, com reembolso integral
            do valor pago, nos termos do art. 49 do Código de Defesa do
            Consumidor. Para isso, basta entrar em contato pelo canal de suporte
            informado abaixo.
          </LegalP>
          <LegalP>
            Após esse prazo, o contrato de 12 (doze) meses permanece vigente.
            Pedidos de cancelamento antecipado serão analisados conforme a
            legislação aplicável e as condições comerciais informadas no
            momento da contratação, com eventual retenção proporcional quando
            admitida em lei.
          </LegalP>
        </LegalSection>

        <LegalSection title="8. Suporte">
          <LegalP>
            O suporte é prestado pelo e-mail{" "}
            <a
              href="mailto:suporte@vorazes.com.br"
              className="underline hover:text-[var(--text)]"
            >
              suporte@vorazes.com.br
            </a>
            , em horário comercial e com esforços comercialmente razoáveis,
            conforme os prazos informados na página{" "}
            <Link href="/suporte" className="underline hover:text-[var(--text)]">
              Suporte
            </Link>
            .
          </LegalP>
        </LegalSection>

        <LegalSection title="9. Obrigações do Usuário">
          <LegalList>
            <li>Utilizar o serviço em conformidade com a lei e com estes Termos.</li>
            <li>
              Não tentar burlar mecanismos de segurança, limites de uso ou
              autenticação, nem sobrecarregar a infraestrutura de forma abusiva.
            </li>
            <li>
              Garantir que possui base legal para inserir dados pessoais de
              terceiros no Software, respondendo por eventual uso indevido.
            </li>
            <li>
              Manter cópias de segurança dos dados que inserir no Software. O
              Vorazes não se responsabiliza por perda decorrente do uso do
              dispositivo, de falhas de armazenamento ou de ausência de backup.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection title="10. Disponibilidade, atualizações e alterações">
          <LegalP>
            O site e o Software podem passar por manutenções, atualizações e
            indisponibilidades temporárias, buscando-se reduzi-las ao mínimo.
            Novas versões do Software podem ser disponibilizadas na página{" "}
            <Link href="/downloads" className="underline hover:text-[var(--text)]">
              Downloads
            </Link>
            .
          </LegalP>
          <LegalP>
            Podemos alterar estes Termos a qualquer momento. A versão vigente
            será sempre publicada nesta página, com a data de atualização, e
            mudanças relevantes serão comunicadas com antecedência razoável. O
            uso do serviço após a publicação implica concordância com os novos
            Termos.
          </LegalP>
        </LegalSection>

        <LegalSection title="11. Limitação de responsabilidade">
          <LegalP>
            Na máxima extensão permitida pela legislação aplicável, o Vorazes não
            responde por lucros cessantes, danos indiretos ou por decisões
            tomadas pelo Usuário com base nas simulações, nem por
            indisponibilidades decorrentes de caso fortuito, força maior ou de
            falhas de terceiros (como provedores de internet, hospedagem ou
            meios de pagamento).
          </LegalP>
          <LegalP>
            Nada nestes Termos limita responsabilidades que não possam ser
            limitadas por lei. Quando admissível, a responsabilidade total do
            Vorazes fica limitada ao valor efetivamente pago pelo Usuário nos 12
            (doze) meses anteriores ao evento.
          </LegalP>
        </LegalSection>

        <LegalSection title="12. Privacidade">
          <LegalP>
            O tratamento de dados pessoais é realizado conforme a{" "}
            <Link
              href="/privacidade"
              className="underline hover:text-[var(--text)]"
            >
              Política de Privacidade
            </Link>
            , em conformidade com a Lei Geral de Proteção de Dados (Lei nº
            13.709/2018).
          </LegalP>
        </LegalSection>

        <LegalSection title="13. Legislação aplicável e foro">
          <LegalP>
            Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro
            da comarca de [CIDADE/UF] para dirimir eventuais controvérsias,
            ressalvada a competência do foro do domicílio do consumidor quando
            aplicável.
          </LegalP>
        </LegalSection>

        <LegalSection title="14. Contato">
          <LegalP>
            Dúvidas sobre estes Termos podem ser enviadas para{" "}
            <a
              href="mailto:suporte@vorazes.com.br"
              className="underline hover:text-[var(--text)]"
            >
              suporte@vorazes.com.br
            </a>
            .
          </LegalP>
        </LegalSection>
      </div>
    </Section>
  );
}
