import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MainPage.module.css';

function MainPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.minimalContainer}>
      <div className={styles.logoContainer}>
        <i className={`fa fa-tooth ${styles.logo}`}> Sorria Odonto</i>
      </div>

      <div className={styles.buttonsContainer}>
        <button 
          onClick={() => navigate('/prontuario')} 
          className={styles.actionButton}
        >
          Prontuário
        </button>
        
        <button 
          onClick={() => navigate('/login')} 
          className={styles.actionButton}
        >
          Login
        </button>
      </div>

      <div className={styles.comingSoon}>
        Em breve...
      </div>
    </div>
  );
}

export default MainPage;