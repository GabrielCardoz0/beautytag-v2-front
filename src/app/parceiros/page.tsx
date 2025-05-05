"use client";
import React, { useEffect, useState } from "react";
import { Table as AntTable, Input, Button, Dropdown, Modal } from "antd";
import { ColumnsType } from "antd/es/table";
import { MoreOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { deleteServico, deleteUser, getUsers } from "@/services";
import { MenuProps } from "antd";
import { useRouter } from "next/navigation";

export default function Parceiros() {
  const [searchText, setSearchText] = useState("");
  const [parceiros, setParceiros] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedParceiro, setSelectedParceiro] = useState<any>(null);

  const router = useRouter();

  const fetchParceiros = async () => {
    try {
      const response = await getUsers({
        "filters[role][$eq]": 4,
        "populate": "*",
      });

      setParceiros(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Houve um erro ao buscar os parceiros!");
    }
  };

  useEffect(() => {
    fetchParceiros();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleDelete= (record: any) => {
    setSelectedParceiro(record);
    setIsModalVisible(true);
  }

  const handleConfirmDelete = async () => {
    try {
      await Promise.all(selectedParceiro.servicos.map(async (servico: any) => await deleteServico(servico.documentId)));
      
      await deleteUser(selectedParceiro.id);

      setIsModalVisible(false);
      toast.success("Parceiro excluído com sucesso!");
      fetchParceiros();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir o parceiro!");
    }
  };

  const handleCancelDelete = () => {
    setIsModalVisible(false);
    setSelectedParceiro(null);
  };

  const getMenuItems = (record: any): MenuProps["items"] => [
    { key: "editar", label: "Editar", onClick: () => router.push(`/parceiros/${record.id}`) },
    { key: "excluir", label: "Excluir", onClick: () => handleDelete(record) },
    { key: "detalhes", label: "Ver detalhes", onClick: () => router.push(`/parceiros/${record.id}`) },
  ];

  const filteredData = parceiros
  .map((item) => ({
    ...item,
    ...item?.metadata,
    servicos_length: item?.servicos?.length ?? 0,
  }))
  .filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchText.toLowerCase()) // Valida se 'value' existe
    )
  );

  const columns: ColumnsType<any> = [
    { title: "Nome", key: "name", dataIndex: "name" },
    { title: "CNPJ", key: "cpf_cnpj", dataIndex: "cpf_cnpj" },
    { title: "Email", key: "email", dataIndex: "email" },
    { title: "Telefone", key: "telefone", dataIndex: "telefone" },
    { title: "CEP", key: "cep", dataIndex: "cep" },
    { title: "Rua", key: "rua", dataIndex: "street" },
    { title: "Bairro", key: "bairro", dataIndex: "neighborhood" },
    { title: "Cidade", key: "cidade", dataIndex: "city" },
    { title: "Serviços", key: "servicos", dataIndex: "servicos_length" },
    {
      title: "Opções",
      key: "options",
      render: (_, record) => (
        <Dropdown
          menu={{ items: getMenuItems(record) }}
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

        <Button type="primary" onClick={() => router.push("/parceiros/criar")}>
          <span className="font-semibold px-8">
            Adicionar
          </span>
        </Button>
      </div>

      <div className="border-b-red-500 border-b-2 mb-4">
        <h1 className="text-lg font-semibold">Parceiros</h1>
      </div>

      <AntTable
        columns={columns}
        dataSource={filteredData.map((item) => ({ ...item, key: item.id }))}
        pagination={{
          pageSize: 10,
          pageSizeOptions: ["1", "2", "3"],
        }}
      />
      <Modal
        title="Confirmar Exclusão"
        open={isModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Excluir"
        cancelText="Cancelar"
      >
        <p>
          Tem certeza que deseja excluir este parceiro? Todos os serviços
          associados a ele serão apagados e esta ação não poderá ser desfeita.
        </p>
      </Modal>
    </div>
  );
}
