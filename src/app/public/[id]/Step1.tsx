
import { Button, Modal, Typography } from "antd";
import Image from "next/image";

const { Title } = Typography;

interface Step1Props {
  handleNextStep: () => void;
  setShowModal: (show: boolean) => void;
  showModal: boolean;
}

export default function Step1({ handleNextStep, setShowModal, showModal }: Step1Props) {
  const videoId = "6--8lDFBhOg";

  return (
    <div className="flex flex-col gap-10">

      <div>
        <Title level={2} className="text-2xl font-bold mb-4">Bem vindo!</Title>
        <p>Cadastre-se e descubra descontos exclusivos em estética e bem-estar, especialmente para você.</p>
      </div>

      <Image src="/assets/beautytag-logo.jpeg" alt="Bem vindo" className="max-w-full mb-4" width={500} height={100} />

      <Button type="primary" onClick={() => setShowModal(true)} style={{ height: "36px", fontWeight: "bold", fontSize: "16px" }}>
        Cadastre-se
      </Button>

      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        centered
      >
        <span>Assista o vídeo abaixo:</span>

        <iframe
          // style={{ width: "100%", height: "56%" }}
          className="w-full h-60 my-8"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
          title="YouTube video"
          // frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />

        <Button type="primary" block onClick={() => { setShowModal(false); handleNextStep(); }} style={{ height: "36px", fontWeight: "bold", fontSize: "16px" }}>
          Acessar
        </Button>
      </Modal>
    </div>
  );
};
