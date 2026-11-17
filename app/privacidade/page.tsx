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
// COMPLETO], [NOME/E-MAIL DO ENCARREGADO]) pelos dados reais da empresa e
// valide o texto com um advogado especializado em LGPD.

export const metadata = {
  title: "Política de privacidade | Vorazes",
  description:
    "Como o Vorazes coleta, usa, compartilha e protege dados pessoais, em conformidade com a LGPD.",
};

export default function PrivacidadePage() {
  return (
    <Section className="pt-16">
      <LegalHeader
        title="Política de Privacidade"
        updatedAt="13 de novembro de 2026"
      />

      <div className="mt-10 max-w-3xl space-y-10">
        <LegalSection title="1. Quem é o controlador">
          <LegalP>
            Esta Política descreve como [RAZÃO SOCIAL], inscrita no CNPJ sob o
            nº [CNPJ], com sede em [ENDEREÇO COMPLETO] (&quot;Vorazes&quot;, &quot;nós&quot;),
            trata dados pessoais em seus sites e serviços, em conformidade com a
            Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
          </LegalP>
          <LegalP>
            Encarregado pelo tratamento de dados pessoais (DPO): [NOME DO
            ENCARREGADO] — [E-MAIL DO ENCARREGADO]. Você também pode falar
            conosco pelo e-mail{" "}
            <a
              href="mailto:suporte@vorazes.com.br"
              className="underline hover:text-[var(--text)]"
            >
              suporte@vorazes.com.br
            </a>
            .
          </LegalP>
        </LegalSection>

        <LegalSection title="2. Dados que coletamos">
          <LegalList>
            <li>
              <strong>Cadastro e contratação:</strong> nome, e-mail, plano
              contratado e status do pagamento.
            </li>
            <li>
              <strong>Pagamento:</strong> os dados do cartão são informados
              diretamente no ambiente do PagBank. Recebemos apenas o
              identificador do checkout e o status da transação; não recebemos
              nem armazenamos o número completo do cartão ou o código de
              segurança.
            </li>
            <li>
              <strong>Suporte:</strong> informações e arquivos que você nos
              envia ao solicitar atendimento.
            </li>
            <li>
              <strong>Dados técnicos de acesso:</strong> endereço IP, data e
              hora, tipo e versão de navegador, páginas acessadas e registros de
              segurança e erros.
            </li>
            <li>
              <strong>Cookies estritamente necessários:</strong> quando
              utilizados, para segurança e funcionamento do site.
            </li>
          </LegalList>
          <LegalP>
            Não coletamos intencionalmente dados pessoais sensíveis (art. 5º,
            II, da LGPD) nem dados de crianças e adolescentes. Caso isso ocorra,
            os dados serão eliminados.
          </LegalP>
        </LegalSection>

        <LegalSection title="3. Como e por que usamos os dados">
          <LegalP>
            Utilizamos os dados pessoais para as seguintes finalidades, com as
            respectivas bases legais:
          </LegalP>
          <LegalList>
            <li>
              <strong>Executar o contrato:</strong> processar a compra, confirmar
              o pagamento, liberar o download, gerenciar o acesso e prestar
              suporte (LGPD, art. 7º, V).
            </li>
            <li>
              <strong>Cumprir obrigações legais e regulatórias:</strong> guarda
              de registros fiscais e financeiros (LGPD, art. 7º, II).
            </li>
            <li>
              <strong>Segurança e prevenção a fraude:</strong> validação de
              pagamentos, limitação de requisições e análise de registros de
              acesso (LGPD, art. 7º, IX — legítimo interesse).
            </li>
            <li>
              <strong>Comunicações sobre o serviço:</strong> avisos
              operacionais, de segurança e de atualização (execução do contrato
              e legítimo interesse).
            </li>
            <li>
              <strong>Marketing:</strong> somente com consentimento, quando
              aplicável, revogável a qualquer momento (LGPD, art. 7º, I).
            </li>
            <li>
              <strong>Exercício regular de direitos:</strong> em processos
              administrativos ou judiciais (LGPD, art. 7º, VI).
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection title="4. Cookies e tecnologias semelhantes">
          <LegalP>
            O site não utiliza cookies de publicidade ou de rastreamento de
            terceiros. Podem ser utilizados cookies estritamente necessários para
            segurança e funcionamento. Caso isso mude, esta Política será
            atualizada e, quando exigido, solicitaremos o seu consentimento.
          </LegalP>
          <LegalP>
            Você pode bloquear ou apagar cookies nas configurações do navegador,
            o que pode afetar o funcionamento de algumas funcionalidades.
          </LegalP>
        </LegalSection>

        <LegalSection title="5. Compartilhamento de dados">
          <LegalList>
            <li>
              <strong>PagBank:</strong> para processar pagamentos e confirmar
              transações.
            </li>
            <li>
              <strong>Provedores de infraestrutura:</strong> hospedagem do site,
              banco de dados em nuvem e provedores de e-mail, que atuam como
              operadores em nosso nome.
            </li>
            <li>
              <strong>Autoridades públicas:</strong> quando houver obrigação
              legal ou ordem fundamentada.
            </li>
          </LegalList>
          <LegalP>
            Não vendemos nem alugamos dados pessoais. Os dados inseridos no
            aplicativo Vorazes permanecem no dispositivo do Usuário e não são
            acessados por nós, exceto quando você nos envia voluntariamente para
            fins de suporte.
          </LegalP>
        </LegalSection>

        <LegalSection title="6. Transferência internacional de dados">
          <LegalP>
            Alguns provedores de infraestrutura podem processar dados fora do
            Brasil. Nesses casos, adotamos salvaguardas e cláusulas contratuais
            adequadas, conforme os arts. 33 a 36 da LGPD.
          </LegalP>
        </LegalSection>

        <LegalSection title="7. Por quanto tempo guardamos os dados">
          <LegalList>
            <li>
              Dados de cadastro e contratação: durante a vigência do contrato e
              enquanto necessário às finalidades desta Política.
            </li>
            <li>
              Registros fiscais e financeiros: pelos prazos exigidos pela
              legislação aplicável (em regra, 5 anos).
            </li>
            <li>
              Registros de acesso: pelo prazo mínimo de 6 meses, quando aplicável
              o Marco Civil da Internet (Lei nº 12.965/2014).
            </li>
          </LegalList>
          <LegalP>
            Encerrados os prazos, os dados são eliminados ou anonimizados, salvo
            hipóteses de guarda obrigatória previstas em lei.
          </LegalP>
        </LegalSection>

        <LegalSection title="8. Direitos do titular">
          <LegalP>
            Nos termos do art. 18 da LGPD, você pode solicitar, a qualquer
            momento:
          </LegalP>
          <LegalList>
            <li>confirmação da existência de tratamento;</li>
            <li>acesso aos dados pessoais;</li>
            <li>correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>
              anonimização, bloqueio ou eliminação de dados desnecessários,
              excessivos ou tratados em desconformidade;
            </li>
            <li>portabilidade, quando aplicável;</li>
            <li>
              informação sobre entidades com as quais compartilhamos dados;
            </li>
            <li>revogação do consentimento, quando o tratamento se basear nele.</li>
          </LegalList>
          <LegalP>
            Para exercer seus direitos, escreva para [E-MAIL DO ENCARREGADO]:
            poderemos solicitar informações para confirmar sua identidade e
            atenderemos nos prazos previstos na LGPD. Você também pode
            apresentar reclamação à Autoridade Nacional de Proteção de Dados
            (ANPD).
          </LegalP>
        </LegalSection>

        <LegalSection title="9. Segurança">
          <LegalP>
            Adotamos medidas técnicas e administrativas para proteger os dados,
            como uso de HTTPS, controle de acesso, validação de pagamentos no
            servidor e limitação de requisições. Nenhum sistema é completamente
            imune a incidentes; caso ocorra incidente relevante, comunicaremos os
            titulares e a ANPD conforme a legislação aplicável.
          </LegalP>
        </LegalSection>

        <LegalSection title="10. Dados no aplicativo Vorazes">
          <LegalP>
            O aplicativo Vorazes é executado no dispositivo do Usuário, e os
            dados das simulações e importações ficam armazenados localmente. O
            site não acessa esses dados. A realização de backups é
            responsabilidade do Usuário. Se você enviar dados ao suporte para
            resolver uma solicitação, eles serão tratados apenas para essa
            finalidade.
          </LegalP>
        </LegalSection>

        <LegalSection title="11. Menores de idade">
          <LegalP>
            O serviço é destinado a maiores de 18 anos e a uso profissional. Não
            coletamos intencionalmente dados de crianças e adolescentes; caso
            identifiquemos esse tipo de dado, ele será eliminado.
          </LegalP>
        </LegalSection>

        <LegalSection title="12. Alterações desta Política">
          <LegalP>
            Esta Política pode ser atualizada para refletir mudanças no serviço
            ou na legislação. A versão vigente estará sempre nesta página, com a
            data de atualização. Mudanças relevantes serão comunicadas com
            antecedência razoável.
          </LegalP>
        </LegalSection>

        <LegalSection title="13. Contato">
          <LegalP>
            Dúvidas sobre esta Política ou sobre seus dados pessoais podem ser
            enviadas para [E-MAIL DO ENCARREGADO] ou para{" "}
            <a
              href="mailto:suporte@vorazes.com.br"
              className="underline hover:text-[var(--text)]"
            >
              suporte@vorazes.com.br
            </a>
            . Consulte também os{" "}
            <Link href="/termos" className="underline hover:text-[var(--text)]">
              Termos de Uso
            </Link>
            .
          </LegalP>
        </LegalSection>
      </div>
    </Section>
  );
}
