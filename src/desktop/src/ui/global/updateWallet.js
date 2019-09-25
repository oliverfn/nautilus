import React from "react";
import PropTypes from "prop-types";
import { withI18n } from "react-i18next";

import Progress from "ui/components/progress";
import Modal from "ui/components/modal/Modal";

export class UpdateWallet extends React.PureComponent {
  static propTypes = {
    t: PropTypes.func.isRequired
  };

  state = {
    progress: null
  };

  componentDidMount() {
    this.onStatusChange = this.statusChange.bind(this);
    Electron.onEvent("update.progress", this.onStatusChange);
  }

  componentWillUnmount() {
    Electron.removeEvent("update.progress", this.onStatusChange);
  }

  /**
   * Update progress percentage state
   * @param {object} progress - Current update progress percent
   */
  statusChange(progress) {
    this.setState({
      progress
    });
  }
  render() {
    const { t } = this.props;
    const { progress } = this.state;
    return (
      <Modal
        variant="global"
        isOpen={progress ? true : false}
        onClose={() => {}}
      >
        <form>
          <h1>{t("updates:downloadingUpdate")}</h1>
          <article>
            {progress && (
              <Progress
              type={"update"}
                progress={progress.percent}
                title={t("updates:downloadProgress", {
                  transferred:
                    (progress.transferred / 1048576).toFixed(2) + " MB",
                  total: (progress.total / 1048576).toFixed(2) + " MB"
                })}
              />
            )}
          </article>
        </form>
      </Modal>
    );
  }
}
export default withI18n()(UpdateWallet);
