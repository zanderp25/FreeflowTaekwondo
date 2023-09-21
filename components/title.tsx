import React from 'react';

import Styles from '../styles/components/title.module.css';

export function SectionHeading(props: React.PropsWithChildren<{
    id: string,
    showLine?: boolean
}>) {
    return <>
        {props.showLine && <div className={Styles.hr} />}
        <h1 className={Styles.h1} id={props.id}>{props.children}</h1>
    </>
}
