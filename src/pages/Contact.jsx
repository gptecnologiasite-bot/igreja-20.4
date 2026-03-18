import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { parseSafeJson } from '../lib/dbUtils';
import { usePageUpdate } from '../hooks/usePageUpdate';
import '../css/Contact.css';

const Contact = () => {
  const [data, setData] = useState({
    title: 'Entre em Contato',
    subtitle: 'Estamos aqui para ouvir você. Envie sua mensagem ou faça-nos uma visita.',
    address: 'QN 516 - Samambaia, Brasília - DF, 72314-200',
    phone: '(61) 99324-1085',
    email: 'admacdf@gmail.com',
    schedule: 'Domingo: 18h | Quinta: 19h30'
  });

  const loadContactData = async () => {
    try {
      const { data: dbData, error } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', 'ministry_contact')
        .limit(1).limit(1).single();

      if (error) {
        console.warn('[Supabase] Erro ao carregar Contato:', error.message);
        
        // Fallback para localStorage
        const raw = localStorage.getItem('admac_site_settings:ministry_contact');
        if (raw) {
          try {
            const local = JSON.parse(raw);
            setData(prev => ({ ...prev, ...local }));
            console.info('[Storage] Usando cache local para Contato.');
            return;
          } catch (e) {
            console.error('[Storage] JSON inválido para Contato:', e);
          }
        }
        return;
      }

      if (dbData && dbData.data) {
        const parsed = parseSafeJson(dbData.data);
        if (parsed) {
          setData(prev => ({ ...prev, ...parsed }));
          // Cacheia para uso offline
          localStorage.setItem('admac_site_settings:ministry_contact', JSON.stringify(parsed));
        }
      }
    } catch (err) {
      console.error('[Contact] Exceção crítica:', err);
    }
  };

  useEffect(() => {
    loadContactData();
  }, []);

  // Sincronização reativa do painel
  usePageUpdate('ministry_contact', loadContactData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      type: 'contact',
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('site_messages').insert(payload);
      if (error) throw error;
      alert('Mensagem enviada com sucesso! Obrigado por entrar em contato.');
      e.target.reset();
    } catch (err) {
      console.error('Error sending message:', err);
      const backups = JSON.parse(localStorage.getItem('admac_messages_backup') || '[]');
      backups.push(payload);
      localStorage.setItem('admac_messages_backup', JSON.stringify(backups));
      alert('Mensagem enviada (Backup Local)! Em breve entraremos em contato.');
      e.target.reset();
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>{data.title}</h1>
        <p>{data.subtitle}</p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <div className="info-card">
            <h3>Informações</h3>
            <div className="info-item">
              <MapPin className="icon" />
              <div>
                <strong>Endereço</strong>
                <p>{data.address}</p>
              </div>
            </div>
            <div className="info-item">
              <Phone className="icon" />
              <div>
                <strong>Telefone</strong>
                <p>{data.phone}</p>
              </div>
            </div>
            <div className="info-item">
              <Mail className="icon" />
              <div>
                <strong>Email</strong>
                <p>{data.email}</p>
              </div>
            </div>
            <div className="info-item">
              <Clock className="icon" />
              <div>
                <strong>Cultos</strong>
                <p>{data.schedule}</p>
              </div>
            </div>
          </div>

          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3837.9987654321!2d-48.089!3d-15.865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDUxJzU0LjAiUyA0OMKwMDUnMjAuNCJX!5e0!3m2!1spt-BR!2sbr!4v1620000000000!5m2!1spt-BR!2sbr"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Localização da ADMAC"
            ></iframe>
          </div>
        </div>

        {/* Contact Form */}
        <div className="form-container">
          <h3>Envie uma Mensagem</h3>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nome Completo</label>
              <input type="text" id="name" name="name" placeholder="Seu nome" required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="seu@email.com" required />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Telefone (Opcional)</label>
              <input type="tel" id="phone" name="phone" placeholder="(61) 99999-9999" />
            </div>

            <div className="form-group">
              <label htmlFor="message">Mensagem</label>
              <textarea id="message" name="message" rows="5" placeholder="Como podemos ajudar?" required></textarea>
            </div>

            <button type="submit" className="submit-btn">
              <Send size={18} /> Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
