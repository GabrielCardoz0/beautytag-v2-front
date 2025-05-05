"use client";
import React, { useEffect, useState } from "react";
import { Table as AntTable, Input, Button, Dropdown, Modal, Form } from "antd";
import { ColumnsType } from "antd/es/table";
import { MoreOutlined } from "@ant-design/icons";
import { createServico, getServicos, getUsers, deleteServico, updateServico } from "@/services"; 
import { toast } from "react-toastify";
import { convertToBRL } from "@/utils";
import ServiceModal from "./ServiceModal";

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
  publishedAt: string;
  plano_servicos: any[];
  users_permissions_user: {
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
    metadata: {
      cep: string;
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
    };
    name: string;
  };
}

export default function Services() {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Servico | null>(null);
  const [editingService, setEditingService] = useState<Servico | null>(null);
  const [form] = Form.useForm();
  const [servicos, setServicos] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState([]);
  //eslint-disable-next-line
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [calculatedValues, setCalculatedValues] = useState({
    collaboratorPrice: 0,
    partnerPrice: 0,
    profit: 0,
  });

  const updateCalculations = () => {
    const price = parseFloat(form.getFieldValue("price")?.replace(/[^\d,]/g, "").replace(",", ".") || "0");
    const transferPercentage = parseFloat(form.getFieldValue("transferPercentage") || "0") / 100;
    const collaboratorPercentage = parseFloat(form.getFieldValue("collaboratorPercentage") || "0") / 100;

    const collaboratorPrice = price - price * collaboratorPercentage;
    const partnerPrice = collaboratorPrice * (1 - transferPercentage);
    const profit = collaboratorPrice * transferPercentage;

    setCalculatedValues({
      collaboratorPrice,
      partnerPrice,
      profit,
    });
  };

  const fetchServicos = async (page = 1) => {
    try {
      const response = await getServicos({
        populate: "*",
      });
      setServicos(response.data.data);
      setTotalPages(response.data.meta.pagination.pageCount);
      setCurrentPage(page);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar serviços");
    }
  };

  const fetchEmpresas = async () => {
    try {
      const response = await getUsers({
        "filters[role][$eq]": 4,
      });
      setEmpresas(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar empresas");
    }
  }

  useEffect(() => {
    fetchServicos();
    fetchEmpresas();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleDeleteServico = (record: Servico) => {
    setSelectedService(record);
    setIsDeleteModalOpen(true);
  };

  const handleEditServico = (record: Servico) => {
    setEditingService(record); // Define o serviço selecionado
    form.setFieldsValue({
      name: record.name,
      description: record.descricao,
      price: convertToBRL(record?.preco ?? 0),
      transferPercentage: record.percent_repasse,
      collaboratorPercentage: record.percent_colab,
      genre: record.genero,
      company: record.users_permissions_user.id,
    }); // Preenche os campos do formulário
    setIsEditModalOpen(true); // Abre o modal de edição
  };

  const handleAddService = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();

    try {
      await createServico({
        data: {
          descricao: values.description,
          name: values.name,
          preco: parseFloat(values.price.replace(/[^\d,]/g, "").replace(",", ".")),
          percent_colab: values.collaboratorPercentage,
          percent_repasse: values.transferPercentage,
          preco_colab: calculatedValues.collaboratorPrice,
          preco_parceiro: calculatedValues.partnerPrice,
          lucro: calculatedValues.profit,
          genero: values.genre,
          users_permissions_user: values.company,
        }
      });

      toast.success("Serviço adicionado com sucesso");
      setIsModalOpen(false);
      form.resetFields();
      fetchServicos();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao adicionar serviço");
    }
  };

  const handleUpdateService = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();

    try {
      await updateServico(
        editingService?.documentId,
        {
        data: {
          descricao: values.description,
          name: values.name,
          preco: parseFloat(values.price.replace(/[^\d,]/g, "").replace(",", ".")),
          percent_colab: values.collaboratorPercentage,
          percent_repasse: values.transferPercentage,
          preco_colab: calculatedValues.collaboratorPrice,
          preco_parceiro: calculatedValues.partnerPrice,
          lucro: calculatedValues.profit,
          genero: values.genre,
          users_permissions_user: values.company,
        },
      });

      toast.success("Serviço atualizado com sucesso");
      setIsEditModalOpen(false);
      form.resetFields();
      fetchServicos(currentPage);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar serviço");
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    try {
      await deleteServico(selectedService.documentId);
      toast.success("Serviço excluído com sucesso");
      setIsDeleteModalOpen(false);
      fetchServicos(currentPage);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir serviço");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    form.resetFields();
  };

  const filteredData = servicos
  .map((item: Servico) => ({
    ...item,
    key: item.id,
    plano_servicos_length: item.plano_servicos.length,
    company: item.users_permissions_user.name,
  }))
  .filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const columns: ColumnsType<any> = [
    { title: "ID", key: "id", dataIndex: "id" },
    { title: "Nome", key: "name", dataIndex: "name" },
    { 
      title: "Descrição", 
      key: "descricao", 
      dataIndex: "descricao", 
      render: (descricao) => <span title={descricao}>{descricao.length > 50 ? `${descricao.substring(0, 50)}...` : descricao}</span>
    },
    { title: "Preço (R$)", key: "preco", dataIndex: "preco", render: (price) => convertToBRL(price ?? 0) },
    { title: "Repasse (R$)", key: "preco_colab", dataIndex: "preco_colab", render: (value) => convertToBRL(value ?? 0) },
    { title: "Parceiro (R$)", key: "preco_parceiro", dataIndex: "preco_parceiro", render: (value) => convertToBRL(value ?? 0) },
    { title: "Gênero", key: "genero", dataIndex: "genero" },
    { title: "Usuários Relacionados", key: "users", dataIndex: "plano_servicos_length" },
    { title: "Parceiro", key: "company", dataIndex: "company" },
    {
      title: "Opções",
      key: "options",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: "editar", label: "Editar", onClick: () => handleEditServico(record) },
              { key: "excluir", label: "Excluir", onClick: () => handleDeleteServico(record) },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="w-full p-4">
      <div className="w-full flex justify-between">
        <Input
          placeholder="Buscar..."
          value={searchText}
          onChange={handleSearch}
          style={{ marginBottom: 16, width: 300 }}
        />

        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          <span className="font-semibold px-8">Adicionar</span>
        </Button>
      </div>

      <div className="border-b-red-500 border-b-2 mb-4">
        <h1 className="text-lg font-semibold">Serviços</h1>
      </div>

      <AntTable
        columns={columns}
        dataSource={filteredData}
        pagination={{
          // current: currentPage,
          // total: totalPages * 10,
          pageSize: 10,
          // onChange: (page) => fetchServicos(page),
        }}
      />

      <ServiceModal
        visible={isModalOpen}
        title="Adicionar Serviço"
        onOk={handleAddService}
        onCancel={handleCancel}
        form={form}
        empresas={empresas}
        calculatedValues={calculatedValues}
        updateCalculations={updateCalculations}
      />

      <ServiceModal
        visible={isEditModalOpen}
        title="Editar Serviço"
        onOk={handleUpdateService}
        onCancel={handleCancel}
        form={form}
        empresas={empresas}
        calculatedValues={calculatedValues}
        updateCalculations={updateCalculations}
      />

      <Modal
        title="Confirmar Exclusão"
        open={isDeleteModalOpen}
        onOk={handleDeleteService}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText={<span className="font-semibold">Excluir</span>}
        cancelText={<span className="font-semibold">Cancelar</span>}
      >
        <p>Tem certeza de que deseja excluir este serviço? Esta ação não poderá ser desfeita.</p>
      </Modal>
    </div>
  );
}