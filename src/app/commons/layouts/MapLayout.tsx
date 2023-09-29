import { FC, MouseEventHandler, ReactNode } from 'react';
import BannerOverlay, { BannerOverlayType } from '../components/BannerOverlay';
import Center from './dashboard/Center';
import Menu from './dashboard/Menu';
import PFullModal, { PFullModalProps } from '@pcomponents/PFullModal';
import Contextual from './dashboard/Contextual';
import NotificationCenter from '../../modules/notification/components/NotificationCenter';
import FullParentOverlayBlock, { FullBlockType } from '../components/FullParentOverlayBlock';

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
	isBlockingCenter?: boolean;
	modal?: PFullModalProps;
	onMouseMove?: MouseEventHandler<HTMLDivElement>;
}
const MapLayout: FC<MapLayoutProps> = (props: MapLayoutProps) => {
	const {
		isLoading,
		children,
		menu,
		isBlockingCenter,
		contextual,
		statusOverlay,
		modal,
		onMouseMove
	} = props;
	return (
		<>
			<Center
				style={menu ? undefined : { gridArea: '1 / 2 / 2 / -1' }}
				isLoading={isLoading?.main}
				onMouseMove={onMouseMove}
			>
				<FullParentOverlayBlock
					type={FullBlockType.DEFAULT}
					isVisible={!!isBlockingCenter}
				/>
				<BannerOverlay
					type={BannerOverlayType.DANGER}
					text={statusOverlay?.text || ''}
					isVisible={!!statusOverlay}
				/>
				{modal && <PFullModal {...modal} />}
				{children}
				<NotificationCenter />
			</Center>
			<Menu isLoading={isLoading?.menu}>{menu}</Menu>
			<Contextual isLoading={isLoading?.contextual}>{contextual}</Contextual>
		</>
	);
};

export default MapLayout;
