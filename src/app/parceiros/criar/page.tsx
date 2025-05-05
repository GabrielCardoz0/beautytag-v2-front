"use client";

import { createUser } from '@/services';
import { Form, Input, Button, Row, Col } from 'antd';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';


export interface FormValues {
  cep: string;
  city: string;
  cnpj: string;
  email: string;
  name: string;
  neighborhood: string;
  number: string;
  phone: string;
  state: string;
  street: string;
}

export default function Page() {
  const router = useRouter();

  const onFinish = async (values: FormValues) => {
    try {
      await createUser({
        name: values.name,
        email: values.email,
        cpf_cnpj: values.cnpj,
        password: values.cnpj,
        username: values.cnpj,
        telefone: values.phone,
        role: 4,
        metadata: {
          cep: values.cep,
          street: values.street,
          number: values.number,
          neighborhood: values.neighborhood,
          city: values.city,
          state: values.state
        }
      });

      toast.success('Colaborador cadastrado com sucesso!');
      router.push('/parceiros');
    } catch (error) {
      console.error(error);

      if(error?.response?.data?.error?.message === "Email already taken"){
        toast.error('Email já cadastrado!');
      } else {
        toast.error('Houve um erro ao cadastrar novo colaborador!');
      }
    }
  };
  
  const onFinishFailed = (errorInfo: any) => {
    console.error('Failed:', errorInfo);
  };
  
  return (
    <div className='mx-auto my-0 py-12'>
      <h1 className='pb-8'><strong>Cadastro de Parceiros</strong></h1>
      <Form
        name="service_provider_form"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        {/* Seção de Informações Pessoais */}
        <div>
          <h2><strong>Informações Pessoais</strong></h2>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nome"
                name="name"
                rules={[{ required: true, message: 'Por favor, insira o nome!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Por favor, insira o email!' },
                  { type: 'email', message: 'Por favor, insira um email válido!' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Telefone"
                name="phone"
                rules={[{ required: true, message: 'Por favor, insira o telefone!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="CNPJ"
                name="cnpj"
                rules={[
                  { required: true, message: 'Por favor, insira o CNPJ!' },
                  { pattern: /^\d{14}$/, message: 'Por favor, insira um CNPJ válido (14 dígitos)!' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className='h-8'></div>
        
        {/* Seção de Endereço */}
        <div>
          <h2><strong>Informações de Endereço</strong></h2>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="CEP"
                name="cep"
                rules={[
                  { required: true, message: 'Por favor, insira o CEP!' },
                  { pattern: /^\d{8}$/, message: 'Por favor, insira um CEP válido (8 dígitos)!' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Rua"
                name="street"
                rules={[{ required: true, message: 'Por favor, insira a rua!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Número"
                name="number"
                rules={[{ required: true, message: 'Por favor, insira o número!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Bairro"
                name="neighborhood"
                rules={[{ required: true, message: 'Por favor, insira o bairro!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Cidade"
                name="city"
                rules={[{ required: true, message: 'Por favor, insira a cidade!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Estado"
                name="state"
                rules={[{ required: true, message: 'Por favor, insira o estado!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </div>
  
        <Form.Item>
          <Button type="primary" htmlType="submit">
            <span className='font-semibold px-8'>Cadastrar</span>
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
