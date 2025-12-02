import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import '../css/Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Entre em Contato</h1>
        <p>Estamos aqui para ouvir você. Envie sua mensagem ou faça-nos uma visita.</p>
      </div>

      <div className="contact-container">
        {/* Contact Info & Map */}
        <div className="contact-info">
          <div className="info-card">
            <h3>Informações</h3>
            <div className="info-item">
              <MapPin className="icon" />
              <div>
                <strong>Endereço</strong>
                <p>QN 516 - Samambaia, Brasília - DF, 72314-200</p>
              </div>
            </div>
            <div className="info-item">
              <Phone className="icon" />
              <div>
                <strong>Telefone</strong>
                <p>(61) 99324-1084</p>
              </div>
            </div>
            <div className="info-item">
              <Mail className="icon" />
              <div>
                <strong>Email</strong>
                <p>admacdf@gmail.com</p>
              </div>
            </div>
            <div className="info-item">
              <Clock className="icon" />
              <div>
                <strong>Cultos</strong>
                <p>Domingo: 18h | Quinta: 19h30</p>
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
          <form className="contact-form">
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
