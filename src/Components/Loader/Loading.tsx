import React from 'react';
import type { CSSProperties } from 'react';
import { ClipLoader } from 'react-spinners'

const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
};

const Loading: React.FC = () => {
    return (
        <ClipLoader
            color={"#808080"}
            cssOverride={override}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
        />
    );
};

export default Loading;
