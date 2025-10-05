import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { type OnboardingData } from '@/components/onboarding/type'
import LanguageSelection from '@/components/onboarding/LanguageSelection';
import EducationSelection from '@/components/onboarding/EducationSelection';
import RoleSelection from '@/components/onboarding/RoleSelection';
import SourceSelection from '@/components/onboarding/SourceSelection';
import PremiumSelection from '@/components/onboarding/PremiumSelection';
import CreateStudySet from '@/components/onboarding/CreateStudySet';

const OnboardingApp: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [data, setData] = useState<OnboardingData>({
        language: 'en',
        education: '',
        role: '',
        source: '',
        premium: false,
        studySet: {
            name: '',
            description: '',
            privacy: 'public'
        }
    });
    const navigate = useNavigate()

    const handleNext = () => {
        setCurrentStep(prev => Math.min(prev + 1, 6));
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleComplete = () => {
        navigate('/dashboard');
    };

    const handleSkipPremium = () => {
        setData({ ...data, premium: false });
        handleNext();
    };

    const handleSelectPremium = () => {
        setData({ ...data, premium: true });
        handleNext();
    };

    const handleStudySetChange = (field: string, value: string) => {
        setData({
            ...data,
            studySet: {
                ...data.studySet!,
                [field]: value
            }
        });
    };

    return (
        <>
            {currentStep === 1 && (
                <LanguageSelection
                    selectedLanguage={data.language}
                    onLanguageSelect={(lang) => setData({ ...data, language: lang })}
                    onNext={handleNext}
                    onBack={handleBack}
                />
            )}
            {currentStep === 2 && (
                <EducationSelection
                    selectedEducation={data.education}
                    onEducationSelect={(edu) => setData({ ...data, education: edu })}
                    onNext={handleNext}
                    onBack={handleBack}
                />
            )}
            {currentStep === 3 && (
                <RoleSelection
                    selectedRole={data.role}
                    onRoleSelect={(role) => setData({ ...data, role })}
                    onNext={handleNext}
                    onBack={handleBack}
                />
            )}
            {currentStep === 4 && (
                <SourceSelection
                    selectedSource={data.source}
                    onSourceSelect={(source) => setData({ ...data, source })}
                    onNext={handleNext}
                    onBack={handleBack}
                />
            )}
            {currentStep === 5 && (
                <PremiumSelection
                    onSelectPremium={handleSelectPremium}
                    onSkip={handleSkipPremium}
                    onBack={handleBack}
                />
            )}
            {currentStep === 6 && (
                <CreateStudySet
                    studySet={data.studySet!}
                    onStudySetChange={handleStudySetChange}
                    onComplete={handleComplete}
                    onSkip={handleComplete}
                    onBack={handleBack}
                />
            )}
        </>
    );
};

export default OnboardingApp;