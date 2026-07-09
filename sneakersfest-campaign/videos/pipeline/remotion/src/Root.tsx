import React from 'react';
import { Composition } from 'remotion';
import { Trailer, TrailerProps } from './Trailer';
import specs from './specs.json';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="Trailer"
        component={Trailer}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={specs[0] as TrailerProps}
      />
    </>
  );
};
