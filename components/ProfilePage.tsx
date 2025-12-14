import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import FormField from './FormField';

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    dataNascimento: '',
    telefone: '',
    ra: '',
  });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Nenhum usuário logado');

      let { data, error } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFormData({
            nome: data.nome || '',
            sobrenome: data.sobrenome || '',
            email: data.email || user.email || '',
            dataNascimento: data.data_nascimento || '',
            telefone: data.telefone || '',
            ra: data.ra || '',
        });
        
        if (data.avatar_url) {
            setAvatarUrl(`${data.avatar_url}?t=${new Date().getTime()}`);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função mantida, mas na prática não será usada pelo usuário pois os campos estão disabled
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let publicAvatarUrl = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        // Salva como avatar_ID para separar da biometria
        const fileName = `avatar_${user.id}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('selfies')
          .upload(filePath, selectedFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('selfies')
          .getPublicUrl(filePath);
          
        publicAvatarUrl = publicUrlData.publicUrl;
      } else {
        // Se não selecionou foto e os campos estão travados, não há nada para salvar
        alert('Para atualizar dados cadastrais, procure a secretaria. Você só pode alterar sua foto de perfil aqui.');
        setUploading(false);
        return; 
      }

      // Prepara atualização (apenas avatar_url vai mudar de fato)
      const updates: any = {
        id: user.id,
        // Reenviamos os dados atuais para garantir consistência, 
        // mas como estão travados, o usuário não mudou nada.
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        data_nascimento: formData.dataNascimento || null,
        telefone: formData.telefone,
        ra: formData.ra,
        updated_at: new Date(),
      };

      if (publicAvatarUrl) {
          updates.avatar_url = publicAvatarUrl;
      }

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;

      alert('Foto de perfil atualizada com sucesso!');
      getProfile(); 

    } catch (error: any) {
      alert('Erro ao atualizar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Avatar Section - A única parte editável */}
        <div className="lg:col-span-1 flex flex-col items-center justify-start pt-0 lg:pt-20">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-4">
            <div className="w-full h-full rounded-full border-[6px] border-brand-dark-blue flex items-center justify-center overflow-hidden bg-gray-100">
               {avatarUrl ? (
                   <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                   <span className="material-icons-outlined text-brand-dark-blue" style={{ fontSize: '120px' }}>person</span>
               )}
            </div>
            <label htmlFor="photo-upload" className="absolute bottom-2 right-2 bg-brand-dark-blue text-white rounded-full p-2 cursor-pointer hover:bg-opacity-90 transition-colors" title="Alterar foto de perfil">
              <span className="material-icons-outlined !text-2xl">photo_camera</span>
              <input id="photo-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          </div>
          <p className="text-gray-500 text-sm font-semibold">Foto de Perfil</p>
          <label htmlFor="photo-upload-button" className="w-full max-w-xs mt-4">
            <span className="flex items-center justify-center gap-2 bg-brand-dark-blue text-white font-bold py-3 px-4 rounded-full w-full cursor-pointer hover:bg-opacity-90 transition-colors">
              <span className="material-icons-outlined !text-xl">photo_camera</span>
              {uploading ? 'ENVIANDO...' : 'ALTERAR FOTO'}
            </span>
            <input id="photo-upload-button" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
        </div>

        {/* Form Section - Tudo bloqueado */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-dark-blue dark:text-gray-200 mb-8">Perfil do Aluno.</h1>
          <p className="text-gray-500 mb-6 text-sm">
            <span className="material-icons-outlined align-middle mr-1 text-base">lock</span>
            Seus dados cadastrais são gerenciados pela secretaria.
          </p>
          
          <form onSubmit={handleSave} className="text-brand-dark-blue dark:text-gray-300">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Dados pessoais.</h2>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-x-6 gap-y-4">
                  <FormField 
                    id="nome" 
                    label="Nome" 
                    value={formData.nome} 
                    onChange={handleChange} 
                    containerClassName="flex-1"
                    disabled={true} 
                  />
                  <FormField 
                    id="sobrenome" 
                    label="Sobrenome" 
                    value={formData.sobrenome} 
                    onChange={handleChange} 
                    containerClassName="flex-1"
                    disabled={true} 
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-x-6 gap-y-4">
                  <FormField 
                    id="email" 
                    label="E-mail" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    containerClassName="flex-[2]"
                    disabled={true}
                  />
                  <FormField 
                    id="dataNascimento" 
                    label="Data de Nascimento" 
                    type="date" 
                    value={formData.dataNascimento} 
                    onChange={handleChange} 
                    containerClassName="flex-[1]"
                    disabled={true} 
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-x-6 gap-y-4">
                  <FormField 
                    id="telefone" 
                    label="Telefone" 
                    type="tel" 
                    value={formData.telefone} 
                    onChange={handleChange} 
                    containerClassName="flex-1"
                    disabled={true} 
                  />
                  <FormField 
                    id="ra" 
                    label="RA (Registro Acadêmico)" 
                    value={formData.ra} 
                    onChange={handleChange} 
                    containerClassName="flex-1"
                    disabled={true}
                  />
                </div>
              </div>
            </section>
            
            <div className="flex justify-end mt-8">
              <button 
                type="submit" 
                disabled={uploading || loading}
                className="bg-brand-dark-blue text-white font-bold py-3 px-10 rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                    <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        SALVANDO...
                    </>
                ) : (
                    'SALVAR FOTO'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;