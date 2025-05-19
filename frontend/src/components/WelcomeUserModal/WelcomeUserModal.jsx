import React, { useState } from 'react';
import './WelcomeUserModal.css';

function WelcomeUserModal({ onSubmit }) {
    const [step, setStep] = useState(0); // 0: accueil, 1: prénom, 2: nom, 3: email
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const progress = Math.round((step / 3) * 100);

    const handleNext = () => setStep(step + 1);
    const handlePrev = () => setStep(step - 1);
    const handleFinish = () => {
        if (firstname.trim() && lastname.trim() && validateEmail(email)) {
            onSubmit({ firstname, lastname, email });
        }
    };

    function validateEmail(email) {
        // Validation simple d'email
        return /^\S+@\S+\.\S+$/.test(email);
    }

    return (
        <div className="welcome-modal-backdrop">
            <div className="welcome-modal">
                <div className="welcome-steps">
                    <div className={`step-dot${step === 0 ? ' active' : ''}`}></div>
                    <div className={`step-dot${step === 1 ? ' active' : ''}`}></div>
                    <div className={`step-dot${step === 2 ? ' active' : ''}`}></div>
                    <div className={`step-dot${step === 3 ? ' active' : ''}`}></div>
                </div>
                {step === 0 && (
                    <>
                        <h2>Bienvenue sur MovieApp !</h2>
                        <p>Pour personnaliser votre expérience, nous allons vous demander votre prénom, nom et email.</p>
                        <button onClick={handleNext}>Commencer</button>
                    </>
                )}
                {step === 1 && (
                    <>
                        <h2>Quel est votre prénom&nbsp;?</h2>
                        <input
                            type="text"
                            placeholder="Prénom"
                            value={firstname}
                            onChange={e => setFirstname(e.target.value)}
                            autoFocus
                        />
                        <div className="welcome-nav-btns">
                            <button onClick={handlePrev} type="button">Retour</button>
                            <button onClick={handleNext} type="button" disabled={!firstname.trim()}>Suivant</button>
                        </div>
                    </>
                )}
                {step === 2 && (
                    <>
                        <h2>Et votre nom&nbsp;?</h2>
                        <input
                            type="text"
                            placeholder="Nom"
                            value={lastname}
                            onChange={e => setLastname(e.target.value)}
                            autoFocus
                        />
                        <div className="welcome-nav-btns">
                            <button onClick={handlePrev} type="button">Retour</button>
                            <button onClick={handleNext} type="button" disabled={!lastname.trim()}>Suivant</button>
                        </div>
                    </>
                )}
                {step === 3 && (
                    <>
                        <h2>Votre email&nbsp;?</h2>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoFocus
                        />
                        <div className="welcome-nav-btns">
                            <button onClick={handlePrev} type="button">Retour</button>
                            <button onClick={handleFinish} type="button" disabled={!validateEmail(email)}>Terminer</button>
                        </div>
                    </>
                )}
                <div className="welcome-progress-bar">
                    <div className="welcome-progress-bar-inner" style={{ width: progress + '%' }} />
                </div>
            </div>
        </div>
    );
}

export default WelcomeUserModal; 