import styles from './styles.module.css';

const steps = ['Step 1', 'Step 2', 'Step 3'] as const;

export function RegistrationProgressIndicator({
  activeStep
}: {
  activeStep: (typeof steps)[number];
}) {
  return (
    <div className={styles.registrationProgressIndicator}>
      <span className={styles.activeStep}>Register: {activeStep}</span>
      <div className={styles.progressIndicators}>
        {steps.map((step, i) => {
          const isHighlighted = i <= steps.indexOf(activeStep);

          return (
            <span
              key={step}
              className={`${styles.progressIndicator} ${isHighlighted ? styles.activeProgressIndicator : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}
