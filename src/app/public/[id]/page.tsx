"use client";

import { useEffect, useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import { createNotification, getPublicFormularioByIdentify } from "@/services";
import { LoadingOutlined } from "@ant-design/icons";

export interface Servico {
  id: number;
  documentId: string;
  name: string;
  descricao: string;
  preco: number;
  percent_colab: number;
  percent_repasse: number;
  preco_colab: number;
  preco_parceiro: number;
  lucro: number;
  genero: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface FormularioOpcao {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  servicos_secundarios: Servico[];
  servico: Servico;
}

interface Formulario {
  id: number;
  documentId: string;
  nome: string;
  descricao: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  formulario_opcaos: FormularioOpcao[];
}

export default function Page() {
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [formData, setFormData] = useState<Formulario | null>(null);

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);


  const { id } = useParams();

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await getPublicFormularioByIdentify(id.toString(), {
        populate: ["formulario_opcaos.servico", "formulario_opcaos.servicos_secundarios"]
      });
      
      setFormData(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao acessar formulário. Por favor tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchForm() }, [id]);

  const handleNextStep = (values?: any) => {

    if(formData.formulario_opcaos.length === 0){
      toast.warning("Este formulário está desabilitado.");
      return;
    }
    if (step === 2 && !acceptedTerms) {
      alert("Você precisa aceitar os termos para continuar.");
      return;
    }

    if(step === 3){
      setUserData(values);
    }

    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  interface FormValues {
    id: string;
    frequency: number;
    frequency_name: string;
  }

  const handleSendForm = async (values: FormValues[]) => {
    try {

      await createNotification({
        data: {
          title: "Novo cadastro de usuário",
          metadata: {
            type: "user",
            user: {
              email: userData.email,
              name: userData.nome,
              password: userData.cpf,
              username: userData.email,
              telefone: userData.whatsapp,
              cpf_cnpj: userData.cpf,
              role: 5,
              metadata: {
                genero: userData.publico,
                data_nascimento: userData.dataNascimento,
                cep: userData.cep,
                empresa: userData.empresa,
              }
            },
            services: values
          }
        }
      });

      handleNextStep();

    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar informações. Por favor tente novamente mais tarde.");
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 text-center w-screen">
      {
        loading ? <LoadingOutlined /> :
        <>
          {
            step === 1 && 
            <Step1
              handleNextStep={handleNextStep}
              setShowModal={setShowModal}
              showModal={showModal}
            />
          }

          {
            step === 2 &&
            <Step2
              acceptedTerms={acceptedTerms}
              setAcceptedTerms={setAcceptedTerms}
              handleNextStep={handleNextStep}
            />
          }

          {
            step === 3 &&
            <Step3
              handleNextStep={handleNextStep}
              handlePrevStep={handlePrevStep}
              userData={userData}
            />
          }

          {
            step === 4 &&
            <Step4
              handlePrevStep={handlePrevStep}
              handleNextStep={handleSendForm}
              options={formData?.formulario_opcaos}
            />
          }

          {
            step === 5 && 
            <Step5 />
          }
        </>
      }
      {/* <span onClick={() => setStep(4)}>AQUI</span> */}
    </div>
  );
}
