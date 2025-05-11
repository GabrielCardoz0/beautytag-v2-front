"use client";

import { useUser } from "@/context/UserContext";
import { getUsers } from "@/services";
import { handleContactClick } from "@/utils";
import { Card, Descriptions, List, Button, Modal } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Metadata {
  genero: string;
  data_nascimento: string;
  cep: string;
  empresa: string;
}

interface Servico {
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
  publishedAt: string | null;
}

interface PlanoServico {
  id: number;
  documentId: string;
  frequencia: string;
  frequencia_value: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  servico: Servico;
}

interface Plano {
  id: number;
  documentId: string;
  is_pago: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  plano_servicos: PlanoServico[];
}

interface Role {
  id: number;
  documentId: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

interface Colaborador {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  cpf_cnpj: string;
  telefone: string;
  metadata: Metadata;
  name: string;
  plano: Plano;
  role: Role;
}

export default function Page() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [loading, setLoading] = useState(false);
  const { getUserFromLocalStorage } = useUser();


  // const colaborador: Colaborador = {
  //   id: 1,
  //   documentId: "123",
  //   username: "johndoe",
  //   email: "johndoe@example.com",
  //   provider: "local",
  //   confirmed: true,
  //   blocked: false,
  //   createdAt: "2023-01-01",
  //   updatedAt: "2023-01-02",
  //   publishedAt: "2023-01-03",
  //   cpf_cnpj: "123.456.789-00",
  //   telefone: "11999999999",
  //   metadata: {
  //     genero: "Masculino",
  //     data_nascimento: "1990-01-01",
  //     cep: "12345-678",
  //     empresa: "Empresa Exemplo",
  //   },
  //   name: "John Doe",
  //   plano: {
  //     id: 1,
  //     documentId: "456",
  //     is_pago: true,
  //     createdAt: "2023-01-01",
  //     updatedAt: "2023-01-02",
  //     publishedAt: "2023-01-03",
  //     plano_servicos: [
  //       {
  //         id: 1,
  //         documentId: "789",
  //         frequencia: "Mensal",
  //         frequencia_value: 1,
  //         createdAt: "2023-01-01",
  //         updatedAt: "2023-01-02",
  //         publishedAt: "2023-01-03",
  //         servico: {
  //           id: 1,
  //           documentId: "101",
  //           name: "Serviço Exemplo",
  //           descricao: "Descrição do serviço",
  //           preco: 100,
  //           percent_colab: 10,
  //           percent_repasse: 5,
  //           preco_colab: 90,
  //           preco_parceiro: 85,
  //           lucro: 15,
  //           genero: "Unissex",
  //           createdAt: "2023-01-01",
  //           updatedAt: "2023-01-02",
  //           publishedAt: "2023-01-03",
  //         },
  //       },
  //       {
  //         id: 1,
  //         documentId: "789",
  //         frequencia: "Mensal",
  //         frequencia_value: 1,
  //         createdAt: "2023-01-01",
  //         updatedAt: "2023-01-02",
  //         publishedAt: "2023-01-03",
  //         servico: {
  //           id: 1,
  //           documentId: "101",
  //           name: "Serviço Exemplo",
  //           descricao: "Descrição do serviço",
  //           preco: 100,
  //           percent_colab: 10,
  //           percent_repasse: 5,
  //           preco_colab: 90,
  //           preco_parceiro: 85,
  //           lucro: 15,
  //           genero: "Unissex",
  //           createdAt: "2023-01-01",
  //           updatedAt: "2023-01-02",
  //           publishedAt: "2023-01-03",
  //         },
  //       },
  //     ],
  //   },
  //   role: {
  //     id: 1,
  //     documentId: "112",
  //     name: "Cliente",
  //     description: "Usuário cliente",
  //     type: "user",
  //     createdAt: "2023-01-01",
  //     updatedAt: "2023-01-02",
  //     publishedAt: "2023-01-03",
  //   },
  // };


  const fetchInfos = async () => {
    try {
      const user = getUserFromLocalStorage();
      setLoading(true);
      const response = await getUsers({
        "filters[id][$eq]": user.id,
        populate: ["plano.plano_servicos.servico", "role", "servicos"],
      });
      setColaborador(response.data[0]);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar suas informações. Tente novamente mais tarde");
    }
  }

  useEffect(() => { fetchInfos() }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (

    <>
      {
      loading
      ? "Carregando"
      : !colaborador ?
      "Não foi possível carregar" :
      <div style={{ padding: "20px" }}>
        <Card title="Informações Pessoais" style={{ marginBottom: "20px" }}>
          <Descriptions column={1}>
            <Descriptions.Item label="Nome">{colaborador.name}</Descriptions.Item>
            <Descriptions.Item label="E-mail">{colaborador.email}</Descriptions.Item>
            <Descriptions.Item label="Telefone">{colaborador.telefone}</Descriptions.Item>
            <Descriptions.Item label="CPF/CNPJ">{colaborador.cpf_cnpj}</Descriptions.Item>
            <Descriptions.Item label="Gênero">{colaborador.metadata.genero}</Descriptions.Item>
            <Descriptions.Item label="Data de Nascimento">{moment(colaborador.metadata.data_nascimento).format("MM.DD.YYYY")}</Descriptions.Item>
            <Descriptions.Item label="CEP">{colaborador.metadata.cep}</Descriptions.Item>
            <Descriptions.Item label="Empresa">{colaborador.metadata.empresa}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Informações do Plano">
          <Descriptions column={1}>
            <Descriptions.Item label="Plano Pago">{colaborador.plano.is_pago ? "Sim" : "Não"}</Descriptions.Item>
            <Descriptions.Item label="Data de Criação">{moment(colaborador.plano.createdAt).format("MM.DD.YYYY HH:mm")}</Descriptions.Item>
          </Descriptions>

          <List
            header={<div>Serviços do Plano</div>}
            dataSource={colaborador.plano.plano_servicos}
            renderItem={(item) => (
              <List.Item>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Serviço">{item.servico.name}</Descriptions.Item>
                  <Descriptions.Item label="Descrição">{item.servico.descricao}</Descriptions.Item>
                  <Descriptions.Item label="Preço">{`R$ ${item.servico.preco.toFixed(2)}`}</Descriptions.Item>
                  <Descriptions.Item label="Frequência">{item.frequencia}</Descriptions.Item>
                </Descriptions>
              </List.Item>
            )}
          />
        </Card> 

        <div className="text-center mt-5" style={{ marginTop: "20px", textAlign: "center" }}>
          <Button type="primary" onClick={showModal}>
            Solicitar alteração no plano
          </Button>

          <div className="h-8"></div>
        </div>

        <Modal
          title="Entrar em Contato"
          open={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              Cancelar
            </Button>,
            <Button key="contact" type="primary" onClick={handleContactClick}>
              Abrir WhatsApp
            </Button>,
          ]}
        >
          <p>Você será redirecionado para o WhatsApp para entrar em contato.</p>
        </Modal>
      </div>
      }
    </>
  );
};
