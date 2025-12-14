import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Declara a variável global `faceapi` para o TypeScript, já que ela é carregada por um script no HTML.
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

    // Função de limpeza para parar a câmera ao sair da página
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getDescritorDoAlunoLogado = async () => {
    // Pega o usuário logado na sessão atual
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      throw new Error("Nenhum usuário logado.");
    }
  
    // Define o caminho da foto. 
    // Ajustado para .jpeg e removendo a pasta 'selfies/' do caminho
    const caminhoDaFoto = `${user.id}.jpeg`; 
  
    // Pega a URL Pública (assumindo que o bucket 'selfies' é público)
    const { data } = supabase.storage
      .from('selfies')
      .getPublicUrl(caminhoDaFoto);
  
    const urlFotoCadastro = data.publicUrl;
  
    console.log("Buscando foto de referência em:", urlFotoCadastro);
  
    try {
      const img = await faceapi.fetchImage(urlFotoCadastro);
      const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
  
      if (!detection) {
        throw new Error(`Não foi possível detectar um rosto na foto de cadastro.`);
      }
      return detection.descriptor;
    } catch (err) {
      console.error(err);
      throw new Error("Erro ao carregar a foto de cadastro. O aluno possui uma selfie salva?");
    }
  };

  const handleCheckin = async () => {
    if (!videoRef.current) return;
    
    setIsProcessing(true);
    setStatusMessage('Processando...');
    setStatusColor('text-orange-500');

    try {
      const descritorSalvo = await getDescritorDoAlunoLogado();
      const descritorWebcam = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();

      if (descritorWebcam) {
        const distancia = faceapi.euclideanDistance(descritorSalvo, descritorWebcam.descriptor);
        
        if (distancia < 0.6) {
          setStatusMessage('Identidade confirmada! Presença registrada.');
          setStatusColor('text-green-500');
          // Aqui você chamaria uma função para salvar a presença no backend
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
          Olá! Olhe para a câmera e clique no botão para confirmar sua presença.
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