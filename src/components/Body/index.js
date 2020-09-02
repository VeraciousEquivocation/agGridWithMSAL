import React from 'react';
import classNames from 'classnames';
import scss from './Body.module.scss';
import TableContextProvider from '../../BodyComponents/TableVirt/TableContext';

import MiddlePane from '../../BodyComponents/TableVirt/agTable';

function Body(props) {

  	return (
		<>

    	<React.Suspense fallback={<div>loading up</div>}>
			<TableContextProvider>
						<div className={classNames(scss.bodyWrapper ) }>
							<div className={scss.mainPlusRight}>
								<div className={scss.mainContent}>
									{/* CHANGE FALLBACK TO MUI SKELETON */}
									<React.Suspense fallback={<div>Loading...</div>}>
										{MiddlePane && <MiddlePane />}
									</React.Suspense>
    							</div>
							</div>
						</div>
			</TableContextProvider>
		</React.Suspense>
		</>
  );
}

export default Body;
