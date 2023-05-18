import { FC, ReactNode } from 'react';
import BannerOverlay, { BannerOverlayType } from '../components/BannerOverlay';
import Center from './dashboard/Center';
import Menu from './dashboard/Menu';
import MenuTools from './map/MenuTools';
import PFullModal, { PFullModalProps } from '@pcomponents/PFullModal';
import Contextual from './dashboard/Contextual';
import NotificationCenter from '../../modules/notification/components/NotificationCenter';

interface MapLayoutProps {
	isLoading?: {
		main?: boolean;
		menu?: boolean;
		contextual?: boolean;
	};
	children: ReactNode;
	//overlay?: ReactNode;
	menu?: ReactNode;
	contextual?: ReactNode;
	statusOverlay?: {
		text: string;
		// variant
	};
	modal?: PFullModalProps;
}
const MapLayout: FC<MapLayoutProps> = (props: MapLayoutProps) => {
	const { isLoading, children, menu, contextual, statusOverlay, modal } = props;
	return (
		<>
			<Center isLoading={isLoading?.main}>
				<BannerOverlay
					type={BannerOverlayType.DANGER}
					text={statusOverlay?.text || ''}
					isVisible={!!statusOverlay}
				/>
				{modal && <PFullModal {...modal} />}
				{children}
				<NotificationCenter />
			</Center>
			<Menu isLoading={isLoading?.menu}>
				<MenuTools />
				{menu}
			</Menu>
			<Contextual isLoading={isLoading?.contextual}>{contextual}</Contextual>
		</>
	);
};

export default MapLayout;
