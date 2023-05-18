import styles from './Kanpur.module.scss';

export interface PTableFooterProps {
	children: React.ReactNode;
}

const PTableFooter = ({ children }: PTableFooterProps) => {
	return <div className={styles.table_actions}>{children}</div>;
};

PTableFooter.propTypes = {};

export default PTableFooter;
