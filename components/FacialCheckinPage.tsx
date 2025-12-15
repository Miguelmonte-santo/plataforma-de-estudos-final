import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Declaração global para a biblioteca que é carregada via CDN no index.html
declare const faceapi: any;

interface FacialCheckinPageProps {
  onBack: () => void;
}

const FacialCheckinPage: React.FC<FacialCheckinPageProps> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [statusMessage, setStatusMessage] = useState('Aguardando verificação...');
  const [statusColor, setStatusColor] = useState('text-gray-500');
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const loadModelsAndStartVideo = async () => {
      try {
        // Carrega os modelos de IA direto do GitHub (CDN)
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        setStatusMessage('Carregando modelos de IA...');
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        ]);
        
        setModelsLoaded(true);
        startVideo();
      } catch (error) {
        console.error("Erro ao carregar modelos:", error);
        setStatusMessage('Erro ao carregar sistema de IA.');
        setStatusColor('text-red-500');
      }
    };

    const startVideo = async () => {
      try {
        setStatusMessage('Iniciando câmera...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatusMessage('Posicione o rosto no centro');
        setStatusColor('text-gray-500');
      } catch (err) {
        console.error("Erro ao acessar webcam:", err);
        setStatusMessage('Sem permissão de câmera.');
        setStatusColor('text-red-500');
      }
    };

    loadModelsAndStartVideo();

    return () => {
      // Limpeza: Desliga a câmera ao sair da tela
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // --- FUNÇÃO BLINDADA ATUALIZADA ---
  const registrarPresencaNoBanco = async (alunoId: string, email: string) => {
    try {
      setStatusMessage('Validando QR Code...');

      const token = sessionStorage.getItem('attendance_token') || new URLSearchParams(window.location.search).get('t');

      if (!token) {
        throw new Error("Token não encontrado. Escaneie novamente.");
      }

      // 1. Busca o token SEM verificar a data no banco (para evitar erro de fuso horário na query)
      const { data: tokenData, error: tokenError } = await supabase
        .from('tokens_presenca')
        .select('*')
        .eq('token', token)
        .single();

      // 2. Se não achou o token, aí sim é erro
      if (tokenError || !tokenData) {
        console.error("Erro banco:", tokenError);
        throw new Error("QR Code inválido ou não encontrado no sistema.");
      }

      // 3. Verifica a data AGORA, no código, com tolerância
      const expiresAt = new Date(tokenData.expires_at).getTime();
      const now = new Date().getTime();
      
      // Se já passou do tempo de expiração
      if (now > expiresAt) {
         throw new Error("O QR Code expirou! Peça para o professor atualizar a tela.");
      }

      setStatusMessage('Registrando presença...');
      
      // Coleta dados do Espião
      const ua = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const dispositivo = isMobile ? 'Mobile' : 'Desktop';
      
      let navegador = 'Desconhecido';
      if (ua.indexOf("Chrome") > -1) navegador = "Chrome";
      else if (ua.indexOf("Safari") > -1) navegador = "Safari";
      else if (ua.indexOf("Firefox") > -1) navegador = "Firefox";

      let ip = 'Desconhecido';
      let localizacao = 'Desconhecido';
      
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.ip) {
            ip = data.ip;
            localizacao = `${data.city}, ${data.region_code} - ${data.country_name}`;
        }
      } catch (e) {
        console.warn("Sem localização precisa.");
      }

      const { error } = await supabase.from('presencas').insert({
        aluno_id: alunoId,
        email: email,
        ip: ip,
        localizacao: localizacao,
        dispositivo: dispositivo,
        navegador: navegador,
        user_agent: ua,
        token_utilizado: token
      });

      if (error) throw error;

      sessionStorage.removeItem('attendance_token');

      setStatusMessage('PRESENÇA CONFIRMADA! ✅');
      setStatusColor('text-green-600 font-bold');
      
      const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg');
      audio.volume = 0.5;
      audio.play().catch(() => {});

      setTimeout(() => {
        onBack();
      }, 3000);

    } catch (err: any) {
      console.error("Erro presença:", err);
      setStatusMessage(err.message || 'Erro ao registrar.');
      setStatusColor('text-red-600 font-bold');
    }
  };
  // -------------------------------------------------------------

  const getDescritorDoAlunoLogado = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) throw new Error("Usuário não logado.");
  
    // Busca a foto OFICIAL na tabela 'alunos'
    const { data: alunoData, error } = await supabase
      .from('alunos')
      .select('id, foto_rosto_url') // Pega o ID também
      .eq('email', user.email)
      .single();

    if (error || !alunoData || !alunoData.foto_rosto_url) {
      throw new Error("Foto de matrícula não encontrada.");
    }
  
    // Baixa a imagem e calcula o descritor facial
    const img = await faceapi.fetchImage(alunoData.foto_rosto_url);
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
  
    if (!detection) throw new Error(`Rosto não detectado na foto de cadastro.`);
    
    return { 
        descriptor: detection.descriptor,
        alunoId: alunoData.id,
        email: user.email 
    };
  };

  const handleCheckin = async () => {
    if (!videoRef.current) return;
    
    setIsProcessing(true);
    setStatusMessage('Analisando biometria...');
    setStatusColor('text-indigo-600');

    try {
      // 1. Pega a assinatura facial oficial
      const dadosAluno = await getDescritorDoAlunoLogado();
      
      // 2. Lê o rosto da webcam agora
      const descritorWebcam = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();

      if (descritorWebcam) {
        // 3. Compara
        const distancia = faceapi.euclideanDistance(dadosAluno.descriptor, descritorWebcam.descriptor);
        console.log("Distância Biométrica:", distancia);
        
        // Limiar: < 0.6 = Mesma pessoa
        if (distancia < 0.6) {
           // SUCESSO! Agora registra no banco com os dados espiões
           await registrarPresencaNoBanco(dadosAluno.alunoId, dadosAluno.email);
        } else {
          setStatusMessage('Rosto não corresponde ao aluno matriculado. ❌');
          setStatusColor('text-red-600 font-bold');
        }
      } else {
        setStatusMessage('Nenhum rosto encontrado na câmera.');
        setStatusColor('text-red-500');
      }
    } catch (error: any) {
      console.error(error);
      setStatusMessage(error.message || 'Erro na verificação.');
      setStatusColor('text-red-500');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="flex flex-col items-center w-full min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center mb-6 mt-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-3">
          <span className="material-icons-outlined text-indigo-500 !text-4xl">face</span>
          Check-in Facial
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Validação biométrica para registro de presença.
        </p>
      </div>

      <div className="relative w-full max-w-2xl aspect-video bg-black rounded-xl shadow-2xl overflow-hidden border-4 border-indigo-100 dark:border-indigo-900 mb-6">
        <video 
            ref={videoRef} 
            className="w-full h-full object-cover transform scale-x-[-1]" // Espelha o vídeo
            autoPlay 
            muted 
            playsInline
        ></video>
        
        {/* Overlay de Guia */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-64 h-80 border-4 border-white rounded-full border-dashed"></div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <div className={`text-xl font-bold text-center py-2 px-4 rounded-lg w-full transition-colors bg-white dark:bg-gray-800 shadow-sm ${statusColor}`}>
          {statusMessage}
        </div>

        <button
          onClick={handleCheckin}
          disabled={!modelsLoaded || isProcessing}
          className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-indigo-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg transform active:scale-95"
        >
          {isProcessing 
            ? <span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></span> 
            : <span className="material-icons-outlined !text-3xl">fingerprint</span>
          }
          <span className="text-lg">CONFIRMAR PRESENÇA</span>
        </button>
        
        <button
          onClick={onBack}
          className="w-full py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          Cancelar e Voltar
        </button>
      </div>
    </section>
  );
};

export default FacialCheckinPage;