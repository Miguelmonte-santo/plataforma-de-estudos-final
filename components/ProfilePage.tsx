import React, { useState } from 'react';
import FormField from './FormField';

const ProfilePage: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    dataNascimento: '',
    telefone: '',
    ra: '',
    rg: '',
    cpf: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: '',
    uf: '',
    cep: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Handle file upload logic here, e.g., display preview
      console.log(e.target.files[0]);
      alert(`Arquivo selecionado: ${e.target.files[0].name}`);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Avatar Section */}
        <div className="lg:col-span-1 flex flex-col items-center justify-start pt-0 lg:pt-20">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-4">
            <div className="w-full h-full rounded-full border-[6px] border-brand-dark-blue flex items-center justify-center">
              <span className="material-icons-outlined text-brand-dark-blue" style={{ fontSize: '120px' }}>person</span>
            </div>
            <label htmlFor="photo-upload" className="absolute bottom-2 right-2 bg-brand-dark-blue text-white rounded-full p-2 cursor-pointer hover:bg-opacity-90 transition-colors">
              <span className="material-icons-outlined !text-2xl">photo_camera</span>
              <input id="photo-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          </div>
          <label htmlFor="photo-upload-button" className="w-full max-w-xs">
            <span className="flex items-center justify-center gap-2 bg-brand-dark-blue text-white font-bold py-3 px-4 rounded-full w-full cursor-pointer hover:bg-opacity-90 transition-colors">
              <span className="material-icons-outlined !text-xl">photo_camera</span>
              ALTERAR FOTO
            </span>
            <input id="photo-upload-button" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
        </div>

        {/* Form Section */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-dark-blue dark:text-gray-200 mb-8">Perfil do Aluno.</h1>
          <form onSubmit={(e) => e.preventDefault()} className="text-brand-dark-blue dark:text-gray-300">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Dados pessoais.</h2>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-x-6 gap-y-4">
                  <FormField id="nome" label="Nome" value={formData.nome} onChange={handleChange} containerClassName="flex-1" />
                  <FormField id="sobrenome" label="Sobrenome" value={formData.sobrenome} onChange={handleChange} containerClassName="flex-1" />
                </div>
                <div className="flex flex-col md:flex-row gap-x-6 gap-y-4">
                  <FormField id="email" label="E-mail" type="email" value={formData.email} onChange={handleChange} containerClassName="flex-[2]" />
                  <FormField id="dataNascimento" label="Data de Nascimento" value={formData.dataNascimento} onChange={handleChange} containerClassName="flex-[1]" />
                </div>
                <div className="flex">
                  <FormField id="telefone" label="Telefone" type="tel" value={formData.telefone} onChange={handleChange} containerClassName="w-full md:w-1/2" />
                </div>
                <div className="flex flex-col md:flex-row gap-x-6 gap-y-4">
                  <FormField id="ra" label="RA" value={formData.ra} onChange={handleChange} containerClassName="flex-1" />
                  <FormField id="rg" label="RG" value={formData.rg} onChange={handleChange} containerClassName="flex-1" />
                  <FormField id="cpf" label="CPF" value={formData.cpf} onChange={handleChange} containerClassName="flex-1" />
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Endereço.</h2>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-x-6 gap-y-4">
                  <FormField id="rua" label="Rua" value={formData.rua} onChange={handleChange} containerClassName="flex-[3]" />
                  <FormField id="numero" label="N°" value={formData.numero} onChange={handleChange} containerClassName="flex-[1]" />
                  <FormField id="complemento" label="Complemento" value={formData.complemento} onChange={handleChange} containerClassName="flex-[2]" />
                </div>
                <div className="flex flex-col md:flex-row gap-x-6 gap-y-4">
                  <FormField id="bairro" label="Bairro" value={formData.bairro} onChange={handleChange} containerClassName="flex-1"/>
                  <FormField id="municipio" label="Município" value={formData.municipio} onChange={handleChange} containerClassName="flex-1"/>
                  <FormField id="uf" label="UF" value={formData.uf} onChange={handleChange} containerClassName="flex-1" />
                  <FormField id="cep" label="CEP" value={formData.cep} onChange={handleChange} containerClassName="flex-1" />
                </div>
              </div>
            </section>

            <div className="flex justify-end mt-8">
              <button type="submit" className="bg-brand-dark-blue text-white font-bold py-3 px-10 rounded-full hover:bg-opacity-90 transition-colors">
                SALVAR
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
