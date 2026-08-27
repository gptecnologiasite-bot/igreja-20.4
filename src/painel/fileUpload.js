export const handleFileUpload = (callback, hasSupabase, supabase) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const MAX_SIZE_MB = hasSupabase ? 5 : 2;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`A imagem é muito grande (limite ${MAX_SIZE_MB}MB). Tente diminuir o tamanho da foto.`);
      return;
    }

    // Tenta enviar para Supabase Storage se disponível
    if (hasSupabase && supabase?.storage) {
      try {
        console.info('[Supabase Storage] Iniciando upload:', file.name);
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const path = `uploads/${safeName}`;
        
        const { error: upErr } = await supabase.storage.from('site-images').upload(path, file, {
          upsert: true,
          contentType: file.type || 'image/jpeg',
          cacheControl: '3600'
        });

        if (!upErr) {
          const { data } = supabase.storage.from('site-images').getPublicUrl(path);
          if (data?.publicUrl) {
            console.info('[Supabase Storage] Upload concluído:', data.publicUrl);
            callback(data.publicUrl);
            return;
          }
        } else {
          console.warn('[Supabase Storage] Erro no upload:', upErr.message);
          if (upErr.message.includes('row-level security') || upErr.status === 403) {
             console.error('ERRO DE PERMISSÃO: O banco de dados bloqueou o upload. Certifique-se de executar o SQL de infraestrutura (setup_infrastructure.sql) no painel do Supabase.');
          }
          // Fallback para Base64 se o erro não for crítico ou se quisermos garantir que o usuário consiga salvar algo (mesmo localmente)
        }
      } catch (storageErr) {
        console.error('Storage Exception:', storageErr);
      }
    }

    // Fallback: Converte para Base64 se não houver Supabase ou se o upload falhar
    console.info('[Upload Fallback] Convertendo imagem para Base64...');
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      if (base64.length > 500000) {
        console.warn('[Upload Warning] Imagem Base64 muito grande. Isso pode causar erro ao salvar no banco de dados.');
      }
      callback(base64);
    };
    reader.readAsDataURL(file);
  };
  input.click();
};