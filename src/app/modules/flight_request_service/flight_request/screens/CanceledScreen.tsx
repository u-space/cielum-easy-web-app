import DashboardLayout from '../../../../commons/layouts/DashboardLayout';
import PageLayout from '../../../../commons/layouts/PageLayout';

const CanceledScreen = () => {
	return (
		<DashboardLayout isLoading={false}>
			<PageLayout footer={<></>}>
				<h1>Payment Canceled</h1>
				<p>Your payment was canceled</p>
			</PageLayout>
		</DashboardLayout>
	);
};

export default CanceledScreen;
