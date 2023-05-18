import classnames from 'classnames';
import { FC, FormEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../auth.module.scss';
import { getAssetPath } from '../../../utils';
import env from '../../../../vendor/environment/env';

const UnloggedLayout: FC<{
	extraClassnames?: string[];
	children?: ReactNode;
	onSubmit?: (event: FormEvent) => void;
}> = ({
	extraClassnames = [],
	children,
	onSubmit = (_evt) => {
		return;
	}
}) => {
	const { t } = useTranslation();

	return (
		<>
			<img
				ref={(img) => {
					if (!img) {
						return;
					}
					const image = img;
					const finishedLoading = () => {
						image.style.transition = 'all 1s linear';
						image.style.opacity = '0.15';
					};
					image.onload = finishedLoading;
					if (image.complete) {
						finishedLoading();
					}
				}}
				className={styles.background}
				alt="Background"
				src={getAssetPath(env.tenant.assets.login_background)}
			/>
			<form
				className={classnames(styles.centered_screen, extraClassnames)}
				onSubmit={onSubmit}
			>
				<img
					className={styles.logo_platform}
					alt={t('Logo of the platform')}
					src={getAssetPath(env.tenant.assets.logo)}
				/>
				{children}
				<img
					className={styles.logo_organization}
					alt={t('Logo of the organization')}
					src={getAssetPath(env.tenant.assets.logo_tenant)}
				/>
			</form>
		</>
	);
};

export default UnloggedLayout;
