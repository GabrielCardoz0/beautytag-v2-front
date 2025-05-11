"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Form, Input, InputNumber } from "antd";
import { toast } from "react-toastify";
import { calculate, CalculateProfit, convertToBRL } from "@/utils";
import { createPlano, createPlanoServico, createServico, createUser, deleteNotification, getNotifications } from "@/services";
import moment from "moment";

interface Notification {
  documentId: string,
  is_read: boolean,
  title: string,
  createdAt: Date,
  metadata: UserNotification | ServiceNotification
}

interface UserNotification {
  type: string
  user: {
    email: string,
    name: string,
    password: string,
    username: string,
    telefone: string,
    cpf_cnpj: string,
    role: number,
    metadata: {
      genero: string,
      data_nascimento: Date,
      cep: string,
      empresa: string
    }
  },
  services: {
    frequency: number,
    frequency_name: string,
    name: string
    id: string
    price: number
  }[]
}

interface ServiceNotification {
  type: string,
  name: string,
  descricao: string,
  preco: number,
  genero: string,
  empresa: string,
  user_id: number,
  user_document_id: string,
}

export default function NotificationsPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isServiceModalVisible, setIsServiceModalVisible] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [serviceForm] = Form.useForm();

  const fectchNotifications = async () => {
    try {
      const res = await getNotifications({
        sort: { createdAt: "desc" }
      });
      setNotifications(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao buscar notificações. Tente novamente mais tarde");
    }
  };

  useEffect(() => { fectchNotifications() }, []);

  const handleViewDetails = (metadata: Notification) => {
    setNotification(metadata);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setNotification(null);
  };

  const deleteAndRefechNotification = async (id: string) => {
    await deleteNotification(id);
    await fectchNotifications();
  }

  const handleCreateUser = async (metadata: UserNotification) => {
    const { user, services } = metadata;
    try {
      
      const createdUser = await createUser({
        email: user.email,
        name: user.name,
        password: user.cpf_cnpj,
        username: user.email,
        telefone: user.telefone,
        cpf_cnpj: user.cpf_cnpj,
        role: 5,
        metadata: {
          genero: user.metadata.genero,
          data_nascimento: user.metadata.data_nascimento,
          cep: user.metadata.cep,
          empresa: user.metadata.empresa,
        }
      });

      const createdPlan = await createPlano({
        data: {
          is_pago: false,
          users_permissions_user: createdUser.data.id,
        }
      });

      await Promise.all(services.map(async (option) => await createPlanoServico({
        data: {
          frequencia_value: option.frequency,
          frequencia: option.frequency_name,
          servico: option.id,
          planos: createdPlan.data.data.documentId,
        }
      })));
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao executar. Tente novamente mais tarde");
    }
  }

  const handleCreateService = async (metadata: ServiceNotification, calculated: CalculateProfit) => {
    const values = await serviceForm.validateFields();
    try {
      await createServico({
        data: {
          name: metadata.name,
          descricao: metadata.descricao,
          preco: metadata.preco,
          genero: metadata.genero,
          users_permissions_user: metadata.user_id,
          percent_colab: values.percent_colab,
          percent_repasse: values.percent_repasse,
          preco_parceiro: calculated.partnerPrice,
          preco_colab: calculated.collaboratorPrice,
          lucro: calculated.profit
        }
      })
      setIsServiceModalVisible(false);
      await deleteAndRefechNotification(notification.documentId);
      toast.success("Serviço criado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar serviço.");
    }
  };

  const handleAccept = async (data: Notification) => {
    try {
      if (data.metadata.type === "user") {
        await handleCreateUser(data.metadata as UserNotification);
        await deleteAndRefechNotification(notification.documentId);
        toast.success("Usuário criado com sucesso!");
      }

      if (data.metadata.type === "service") {
        setNotification(data);
        setIsServiceModalVisible(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar notificação.");
    }
  };

  const handleReject = async (data: Notification) => {
    try {
      await deleteAndRefechNotification(data.documentId);
      toast.success("Notificação recusada e removida.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao recusar notificação.");
    }
  };

  const columns = [
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Ações",
      key: "actions",
      render: (_: any, record: any) => (
        <div className="flex gap-4">
          <Button type="link" onClick={() => handleViewDetails(record)}>
            Ver Detalhes
          </Button>
          <Button type="primary" onClick={() => handleAccept(record)}>
            Aceitar
          </Button>
          <Button danger onClick={() => handleReject(record)}>
            Recusar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 w-full">
    <div className="border-b-red-500 border-b-2 mb-4">
      <h1 className="text-lg font-semibold">Notificações</h1>
    </div>

      <Table
        dataSource={notifications}
        columns={columns}
        rowKey={(record) => record.id}
        pagination={false}
        style={{
          width: "100%"
        }}
      />

      <Modal
        title="Detalhes do Usuário"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Fechar
          </Button>,
        ]}
      >
        {notification && notification.metadata ? ( // Adicionada verificação para evitar erro de null
          notification.metadata.type === "user"
            ? <UserNotification notification={notification.metadata as UserNotification} />
            : <ServiceNotification notification={notification.metadata as ServiceNotification} />
        ) : (
          <p>Detalhes não disponíveis.</p>
        )}
      </Modal>

      <CompleteServiceModal
        isServiceModalVisible={isServiceModalVisible}
        setIsServiceModalVisible={setIsServiceModalVisible}
        handleCreateService={handleCreateService}
        notification={notification?.metadata as ServiceNotification}
        serviceForm={serviceForm}
      />
    </div>
  );
}

const UserNotification = ({ notification }: { notification: UserNotification }) => {
  return (
    <>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Nome">{notification.user.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{notification.user.email}</Descriptions.Item>
        <Descriptions.Item label="Telefone">{notification.user.telefone}</Descriptions.Item>
        <Descriptions.Item label="CPF/CNPJ">{notification.user.cpf_cnpj}</Descriptions.Item>
        <Descriptions.Item label="Gênero">{notification.user.metadata.genero}</Descriptions.Item>
        <Descriptions.Item label="Data de Nascimento">
          {moment(notification.user.metadata.data_nascimento).format("MM/DD/YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="CEP">{notification.user.metadata.cep}</Descriptions.Item>
        <Descriptions.Item label="Empresa">{notification.user.metadata.empresa}</Descriptions.Item>
      </Descriptions>

      <h3 style={{ marginTop: "20px" }}>Serviços</h3>
      <Table
        dataSource={notification.services}
        columns={[
          {
            title: "Serviço",
            dataIndex: "name", // Corrigido para o campo correto
            key: "name",
          },
          {
            title: "Preço",
            dataIndex: "price", // Corrigido para o campo correto
            key: "price",
            render: (price) => (price ? convertToBRL(price ?? 0) : "N/A"), // Evitar erro de undefined
          },
          {
            title: "Frequência",
            dataIndex: "frequency_name",
            key: "frequency_name",
          },
        ]}
        rowKey={(record) => record.id}
        pagination={false}
        size="small"
      />
    </>
  );
};

const ServiceNotification = ({ notification }: { notification: ServiceNotification }) => {
  return (
    <>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Nome">{notification.name || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Descrição">{notification.descricao || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Preço">
          {notification?.preco ? convertToBRL(notification.preco ?? 0) : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Gênero">{notification?.genero || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Empresa">{notification?.empresa || "N/A"}</Descriptions.Item>
      </Descriptions>
    </>
  );
};

interface CompleteServiceModalProps {
  isServiceModalVisible: boolean;
  setIsServiceModalVisible: Dispatch<SetStateAction<boolean>>,
  handleCreateService: (metadata: ServiceNotification, calculated: CalculateProfit) => Promise<void>,
  notification: ServiceNotification,
  serviceForm: any
}

const CompleteServiceModal = ({ isServiceModalVisible, setIsServiceModalVisible, handleCreateService, notification, serviceForm }: CompleteServiceModalProps) => {
  const [calculated, setCalculated] = useState({
    collaboratorPrice: 0,
    partnerPrice: 0,
    profit: 0,
  });

  return (
    <Modal
      title="Completar Informações do Serviço"
      open={isServiceModalVisible}
      onCancel={() => setIsServiceModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setIsServiceModalVisible(false)}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => handleCreateService(notification, calculated)}
        >
          Criar Serviço
        </Button>,
      ]}
    >
      <Form
        form={serviceForm}
        layout="vertical"
        onValuesChange={() => {
          const preco = notification?.preco ?? 0;
          const percentColab = serviceForm.getFieldValue("percent_colab") ?? 0;
          const percentRepasse = serviceForm.getFieldValue("percent_repasse") ?? 0;
          const calculatedValues = calculate(preco, percentColab, percentRepasse);
          setCalculated(calculatedValues);
        }}
      >
        <Form.Item label="Nome" name="name" initialValue={notification?.name}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="Descrição" name="descricao" initialValue={notification?.descricao}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="Preço" name="preco" initialValue={notification?.preco ? convertToBRL(notification?.preco ?? 0) : notification?.preco}>
          <InputNumber disabled style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Gênero" name="genero" initialValue={notification?.genero}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="Percentual Colaborador" name="percent_colab" rules={[{ required: true, message: "Campo obrigatório" }]}>
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Percentual Repasse" name="percent_repasse" rules={[{ required: true, message: "Campo obrigatório" }]}>
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <div>
          <p>Preço para Colaborador: {convertToBRL(calculated.collaboratorPrice ?? 0)}</p>
          <p>Preço para Parceiro: {convertToBRL(calculated.partnerPrice ?? 0)}</p>
          <p>Lucro: {convertToBRL(calculated.profit ?? 0)}</p>
        </div>
      </Form>
    </Modal>
  )
}