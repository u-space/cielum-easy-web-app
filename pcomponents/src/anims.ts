export const onOff = {
	off: { opacity: 0 },
	on: { opacity: 1 }
};

export const shift = {
	shiftUp: { transform: 'translateY(-50px)', opacity: 0 },
	center: { transform: 'translateY(0px)', opacity: 1 },
	shiftDown: { transform: 'translateY(50px)', opacity: 0 }
};

export const onOffMaterializeVariants = {
	off: { opacity: 0, transform: 'scaleY(0)' },
	on: { opacity: 1, transform: 'scaleY(1)' }
};

/* Should be used for events that block the normal usage of the application and require immediate attention */
export const catchAttention = {
	off: { opacity: 0, filter: 'blur(10px)' },
	on: { opacity: 1, filter: 'blur(0px)' }
};
