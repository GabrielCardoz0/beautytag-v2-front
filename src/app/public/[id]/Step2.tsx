import { Button, Checkbox, Typography } from "antd";
const { Title, Text } = Typography;

interface Step2Props {
  handleNextStep: () => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (accepted: boolean) => void;
}

export default function Step2({ handleNextStep, acceptedTerms, setAcceptedTerms }: Step2Props) {
  return (
    <div>
      <Title level={2} className="text-2xl font-bold mb-4">Termos e Condições</Title>
      <Text className="block mb-4">Leia os termos e condições abaixo:</Text>
      <div className="mb-4 h-52 overflow-y-auto border border-gray-300 p-2 text-left">
        <p>
          Este formulário é um serviço oferecido pela empresa Beautytag®.
          Ao preencher este formulário, você concorda com os termos e condições
          de uso da empresa, concordando em disponibilizar seus dados
          pessoais para fins de marketing e comunicação, de acordo com a legislação vigente.
        </p>
        <ul>
          <li>Ao utilizar esta ferramenta, você concorda em disponibilizar seus dados pessoais para a empresa Beautytag®.</li>
          <li>A empresa poderá utilizar esses dados para fins de marketing e comunicação, de acordo com a legislação vigente.</li>
          <li>A empresa se compromete a proteger e manter a confidencialidade dos seus dados pessoais.</li>
          <li>Você pode solicitar a exclusão dos seus dados a qualquer momento, entrando em contato com a empresa.</li>
        </ul>
      </div>
      <Checkbox
        checked={acceptedTerms}
        onChange={(e) => setAcceptedTerms(e.target.checked)}
      >
        Eu aceito os termos e condições
      </Checkbox>
      <div className="h-8"></div>
      <Button type="primary" block onClick={handleNextStep} style={{ height: "36px", fontWeight: "bold", fontSize: "16px" }}>
        Continuar
      </Button>
    </div>
    );
};
