import React from 'react';

const MessageBox = ({ message, onClose }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.messageBox}>
        <h3>Сообщение</h3>
        <p>{message}</p>
        <button onClick={onClose} style={styles.button}>Закрыть</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBox: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
  },
  button: {
    backgroundColor: '#ff3366',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default MessageBox;