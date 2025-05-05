"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { toast } from 'react-toastify';
import { getMe, login } from '@/services';
import { User, useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [loading, setLoading] = useState(false);
  const { saveUserToLocalStorage } = useUser();
  const router = useRouter();

  const onFinish = async (values: { login: string; password: string }) => {
    setLoading(true);
    try {
      const res = await login({ identifier: values.login, password: values.password });

      const me: { data: User } = await getMe({ populate: "*" }, res.data.jwt);

      saveUserToLocalStorage(me.data, res.data.jwt);

      const role = me.data.role.name;
      switch (role.toLocaleLowerCase()) {
        case 'admin':
          router.push('/notifications');
          break;
        case 'empresa':
          router.push('/painel-parceiro');
          break;
        case 'colaborador':
          router.push('/painel-colaborador');
          break;
        default:
          toast.error('Role do usuário não reconhecida.');
          break;
      }

      toast.success('Login bem-sucedido!');
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro fazer login. Favor tente novamente mais tarde.');
    }
    setLoading(false);
  };

  return (
    <div className='w-screen h-screen flex flex-col md:flex-row justify-center gap-12 md:gap-52 items-center'>
      <div className='flex justify-center items-center'>
        <Image
        src="/assets/beautytag-logo.jpeg"
        alt="Beauty tag logo" width={400}
        height={400}
        className='w-[150px] h-[150px] md:w-[400px] md:h-[400px]'
        />
      </div>

      <div className="flex justify-center items-center">
        <div className="w-80 p-8 shadow-sm rounded-lg"> 

          <h2 className="text-center font-bold">Faça seu login</h2>
            <Form onFinish={onFinish}>
            <Form.Item
              name="login"
              label="Login"
              rules={[{
              required: true,
              message: 'Digite seu login'
              }]}
              labelCol={{ span: 24, style: { padding: 0 } }}
            >
              <Input placeholder="username" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Senha"
              rules={[{
                required: true,
                message: 'Digite sua senha'
              }]}
              labelCol={{ span: 24,  style: { padding: 0 } }} 
            >
              <Input.Password placeholder="Senha" />
            </Form.Item>

            <div className='h-4'></div>

            <Button type="primary" htmlType="submit" loading={loading} block>
              <span className='font-bold'>Login</span>
            </Button>
          </Form>

        </div>
      </div>

    </div>
  );
};