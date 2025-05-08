"use client";

import React, { useState, useEffect } from "react";
import { Table as AntTable, Input, Button, Dropdown, Modal, Form, Select, DatePicker } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { createCheckin, deleteCheckin, getCheckins, getServicos, updateCheckin } from "@/services";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";
import moment from "moment";
import { formatPhoneNumber } from "@/utils";
import dayjs from "dayjs";


interface EditRecord {
  telefone: string,
  servico: string,
  estado: string,
  data_reservada: Date
}

export default function Checkins() {
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [services, setServices] = useState([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchCheckins = async () => {
    try {
      const checkins = await getCheckins({
        sort: { createdAt: "desc" }
      });
      setData(checkins.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar check-ins. Tente novamente.");
    }
  };

  const fetchServices = async () => {
    try {
      const serviceList = await getServicos({});
      setServices(serviceList.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar serviços. Tente novamente.");
    }
  };

  useEffect(() => {
    fetchCheckins();
    fetchServices();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleMenuClick = (key: string, record: EditRecord) => {
    if (key === "excluir") {
      setSelectedCheckin(record);
      setIsDeleteModalVisible(true);
    } else if (key === "editar") {

      setSelectedCheckin(record);

      editForm.setFieldsValue({
        telefone: record.telefone,
        servico: record.servico,
        estado: record.estado,
        data_dia: dayjs(record.data_reservada),
        data_hora: moment(record.data_reservada).clone().startOf("minute"),
        // data: moment(record.data_reservada),
      });
      setIsEditModalVisible(true);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCheckin(selectedCheckin.documentId);
      toast.success("Check-in excluído com sucesso!");
      setIsDeleteModalVisible(false);
      fetchCheckins();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir check-in. Tente novamente.");
    }
  };

  function concatDayHour(data_dia, data_hora) {
    const formatedDay = moment(new Date(data_dia)).format("YYYY-MM-DD")
    const formatedHour = moment(new Date(data_hora).toISOString()).format("HH:mm.SSS")

    return formatedDay + "T" + formatedHour;
  };

  const handleAdd = async (values: any) => {
    const formatedDate = concatDayHour(values.data_dia, values.data_hora)

    try {
      const payload = {
        telefone: values.telefone,
        servico: values.servico,
        estado: "pendente",
        hash: uuid().split("-")[0],
        data_reservada: formatedDate,
      };

      await createCheckin({ data: payload });

      toast.success("Check-in criado com sucesso!");
      setIsAddModalVisible(false);
      fetchCheckins();
      form.resetFields();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar check-in. Tente novamente.");
    }
  };

  const handleEdit = async (values: any) => {
    try {
      const payload = {
        estado: values.estado,
        telefone: values.telefone,
        servico: values.servico,
        data_reservada: concatDayHour(values.data_dia, values.data_hora),
      };

      await updateCheckin(selectedCheckin.documentId, { data: payload });
      toast.success("Check-in atualizado com sucesso!");
      setIsEditModalVisible(false);
      fetchCheckins();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar check-in. Tente novamente.");
    }
  };

  const columns: ColumnsType<any> = [
    { title: "Código", key: "hash", dataIndex: "hash" },
    {
      title: "Status",
      key: "status",
      dataIndex: "estado",
      render: (estado, record) => (
        <Select
          value={estado}
          style={{ width: 150 }} // Define a largura do input
          onChange={async (value) => {
            try {
              const payload: any = {
                estado: value,
                servico: record.servico,
                data_reservada: record.data_reservada,
              };

              if(value === "finalizado"){
                payload.data_fim = new Date().toISOString();
              }

              if(value === "inciado"){
                payload.data_inicio = new Date().toISOString();
              }

              await updateCheckin(record.documentId, { data: payload });
              toast.success("Status do checkin atualizado com sucesso!");
              fetchCheckins();
            } catch (error) {
              console.error(error);
              toast.error("Erro ao atualizar status. Tente novamente.");
            }
          }}
          options={[
            { value: "pendente", label: "Pendente" },
            { value: "inciado", label: "Iniciado" },
            { value: "finalizado", label: "Finalizado" },
            { value: "cancelado", label: "Cancelado" },
          ]}
        />
      ),
    },
    { title: "Telefone", key: "telefone", dataIndex: "telefone" },
    { title: "Serviço", key: "servico", dataIndex: "servico" },
    {
      title: "Criação",
      key: "created_at",
      dataIndex: "createdAt",
      render: (createdAt) => createdAt ? moment(createdAt).format("DD.MM.YYYY HH:mm") : "-",
    },
    {
      title: "Reserva",
      key: "data_reservada",
      dataIndex: "data_reservada",
      render: (data_reservada) => data_reservada ? moment(data_reservada).format("DD.MM.YYYY HH:mm") : "-",
    },
    {
      title: "Check-in",
      key: "check_in",
      dataIndex: "data_inicio",
      render: (data_inicio) => data_inicio ? moment(data_inicio).format("DD.MM.YYYY HH:mm") : "-",
    },
    {
      title: "Check-out",
      key: "check_out",
      dataIndex: "data_fim",
      render: (data_fim) => data_fim ? moment(data_fim).format("DD.MM.YYYY HH:mm") : "-",
    },
    {
      title: "Opções",
      key: "options",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: "editar", label: "Editar", onClick: () => handleMenuClick("editar", record) },
              { key: "excluir", label: "Excluir", onClick: () => handleMenuClick("excluir", record) },
              // { key: "detalhes", label: "Ver detalhes", onClick: () => handleMenuClick("detalhes", record) },
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
        <Button type="primary" onClick={() => setIsAddModalVisible(true)}>
          <span className="font-semibold px-8">Adicionar</span>
        </Button>
      </div>

      <div className="border-b-red-500 border-b-2 mb-4">
        <h1 className="text-lg font-semibold">Check-ins</h1>
      </div>

      <AntTable 
        columns={columns} 
        dataSource={data.map(item => ({ ...item, key: item.documentId }))}
        pagination={{ pageSize: 10 }} 
      />

      <ModalDelete
        handleDelete={handleDelete}
        isDeleteModalVisible={isDeleteModalVisible}
        setIsDeleteModalVisible={setIsDeleteModalVisible}
      />

      <Modal
        title="Adicionar Check-in"
        open={isAddModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsAddModalVisible(false)}
        okText="Criar"
        cancelText="Cancelar"
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item name="telefone" label="Telefone" rules={[{ required: true, message: "Campo obrigatório" }]}>
            <Input
              placeholder="(00) 00000-0000"
              maxLength={15}
              onChange={(e) => form.setFieldValue("telefone", formatPhoneNumber(e.target.value))}
            />
          </Form.Item>

          <Form.Item name="servico" label="Serviço" rules={[{ required: true, message: "Campo obrigatório" }]}>
            <Select>
              {services.map((service: any) => (
                <Select.Option key={service.name} value={service.name}>
                  {service.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="data_dia" label="Data" rules={[{ required: true, message: "Campo obrigatório" }]}>
            <DatePicker format="YYYY-MM-DD"/>
          </Form.Item>

          <Form.Item name="data_hora" label="Hora" rules={[{ required: true, message: "Campo obrigatório" }]}>
            <DatePicker format="HH:mm" picker="time"/>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Editar Check-in"
        open={isEditModalVisible}
        onOk={() => editForm.submit()}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form form={editForm} onFinish={handleEdit} layout="vertical">
          <Form.Item name="telefone" label="Telefone" rules={[{ required: true, message: "Campo obrigatório" }]}>
            <Input
              placeholder="(00) 00000-0000"
              maxLength={15}
              onChange={(e) => editForm.setFieldValue("telefone", formatPhoneNumber(e.target.value))}
            />
          </Form.Item>

          <Form.Item name="servico" label="Serviço" rules={[{ required: true, message: "Campo obrigatório" }]}>
            <Select>
              {services.map((service: any) => (
                <Select.Option key={service.name} value={service.name}>
                  {service.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="estado" label="Estado" rules={[{ required: true, message: "Campo obrigatório" }]}>
            <Select>
              <Select.Option value="pendente">Pendente</Select.Option>
              <Select.Option value="finalizado">Finalizado</Select.Option>
              <Select.Option value="cancelado">Cancelado</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="data_dia" label="Data" rules={[{ required: true, message: "Campo obrigatório" }]}>
            <DatePicker picker="date" />
          </Form.Item>

          <Form.Item name="data_hora" label="Hora" rules={[{ required: true, message: "Campo obrigatório" }]}>
            <DatePicker format="HH:mm" picker="time" />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}



const ModalDelete = ({ isDeleteModalVisible, handleDelete, setIsDeleteModalVisible}) => {
  return (
    <Modal
      title="Excluir Check-in"
      open={isDeleteModalVisible}
      onOk={handleDelete}
      onCancel={() => setIsDeleteModalVisible(false)}
      okText="Confirmar"
      cancelText="Cancelar"
    >
      <p>Tem certeza que deseja excluir este check-in?</p>
    </Modal>
  )
}