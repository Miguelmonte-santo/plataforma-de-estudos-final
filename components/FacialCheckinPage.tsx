import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Declara a variável global `faceapi`
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
        setStatusMessage('Erro ao carregar modelos de IA.');
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
        setStatusMessage('Aguardando verificação...');
        setStatusColor('text-gray-500');
      } catch (err) {
        console.error("Erro ao acessar a webcam:", err);
        setStatusMessage('Não foi possível acessar a webcam. Verifique as permissões.');
        setStatusColor('text-red-500');
      }
    };

    loadModelsAndStartVideo();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getDescritorDoAlunoLogado = async () => {
    // 1. Pega o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user || !user.email) {
      throw new Error("Nenhum usuário logado.");
    }
  
    console.log("Buscando foto oficial para o email:", user.email);

    // 2. Busca a URL da foto OFICIAL na tabela 'alunos' (A "Matriz Biométrica")
    // Usamos o email para vincular, pois é o dado comum entre Auth e Alunos
    const { data: alunoData, error } = await supabase
      .from('alunos')
      .select('foto_rosto_url')
      .eq('email', user.email)
      .single();

    if (error || !alunoData || !alunoData.foto_rosto_url) {
      console.error("Erro Supabase:", error);
      throw new Error("Foto de matrícula não encontrada. Entre em contato com a secretaria.");
    }
  
    const urlFotoCadastro = alunoData.foto_rosto_url;
    console.log("Foto de referência encontrada:", urlFotoCadastro);
  
    try {
      // 3. Baixa a imagem e calcula o descritor facial
      // O 'crossOrigin' é importante para imagens vindas do Supabase Storage
      const img = await faceapi.fetchImage(urlFotoCadastro);
      const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
  
      if (!detection) {
        throw new Error(`Não foi possível detectar um rosto na foto de cadastro (Matrícula).`);
      }
      return detection.descriptor;
    } catch (err: any) {
      console.error(err);
      throw new Error("Erro ao processar a foto de cadastro: " + err.message);
    }
  };

  const handleCheckin = async () => {
    if (!videoRef.current) return;
    
    setIsProcessing(true);
    setStatusMessage('Processando...');
    setStatusColor('text-orange-500');

    try {
      // 1. Busca a assinatura facial da foto oficial
      const descritorSalvo = await getDescritorDoAlunoLogado();
      
      // 2. Lê o rosto da webcam agora
      const descritorWebcam = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();

      if (descritorWebcam) {
        // 3. Compara os dois
        const distancia = faceapi.euclideanDistance(descritorSalvo, descritorWebcam.descriptor);
        console.log("Distância Euclidiana (Diferença):", distancia);
        
        // Limiar de 0.6 é o padrão da biblioteca. Menor = Mais parecido.
        if (distancia < 0.6) {
          setStatusMessage('Identidade confirmada! Presença registrada.');
          setStatusColor('text-green-500');
          // TODO: Chamar função para salvar o registro na tabela 'presencas'
        } else {
          setStatusMessage('Rosto não corresponde ao cadastro. Tente novamente.');
          setStatusColor('text-red-500');
        }
      } else {
        setStatusMessage('Nenhum rosto detectado. Posicione-se em frente à câmera.');
        setStatusColor('text-red-500');
      }
    } catch (error: any) {
      console.error(error);
      setStatusMessage(error.message || 'Ocorreu um erro durante a verificação.');
      setStatusColor('text-red-500');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="flex flex-col items-center w-full">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-3">
          <span className="material-icons-outlined text-indigo-500 !text-4xl" aria-hidden="true">camera_alt</span>
          Check-in Facial
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Validação biométrica com base na sua foto de matrícula.
        </p>
      </div>

      <div className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-lg shadow-lg overflow-hidden border-4 border-gray-300 dark:border-gray-700 mb-6">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline></video>
      </div>
      
      <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
        <button
          onClick={handleCheckin}
          disabled={!modelsLoaded || isProcessing}
          className="w-full bg-brand-dark-blue text-white font-bold py-3 px-10 rounded-full hover:bg-opacity-90 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing 
            ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> 
            : <span className="material-icons-outlined !text-2xl">fingerprint</span>
          }
          CONFIRMAR PRESENÇA
        </button>
        <button
          onClick={onBack}
          className="w-full sm:w-auto text-sm text-gray-600 dark:text-gray-400 hover:underline"
        >
          Voltar para Presenças
        </button>
        <div className={`text-lg font-semibold text-center h-8 transition-colors ${statusColor}`}>
          {statusMessage}
        </div>
      </div>
    </section>
  );
};

export default FacialCheckinPage;