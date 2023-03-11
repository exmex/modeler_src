import React, { Component } from "react";
import { TEST_ID, getAppTitle } from "common";
import { storeSettings, updateSettingsProperty } from "../../actions/settings";

import Draggable from "react-draggable";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import isElectron from "is-electron";
import { toggleEulaModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class ModalEula extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  async onConfirmClick() {
    await this.props.updateSettingsProperty(true, "eula_im");
    await this.props.storeSettings();
    this.props.toggleEulaModal();
  }
  onQuitClick() {
    if (isElectron()) {
      ipcRenderer.send("app:quit", "just quit");
    }
  }

  getHeader() {
    return "License agreement";
  }

  getEula() {
    return (
      <div style={{ maxHeight: "50vh", height: "50vh" }}>
        <pre>
          {`IMPORTANT NOTICE: CAREFULLY READ AND BE SURE YOU UNDERSTAND THIS END USER LICENSE AGREEMENT ("EULA") BEFORE YOU ACCEPT ITS PROVISIONS. IDEAMERIT IS WILLING TO LICENSE THE SOFTWARE TO YOU ONLY IF YOU ACCEPT ALL OF THE PROVISIONS OF THIS EULA. BY CLICKING THE "I AGREE" OR "YES" BUTTON, BY LOADING THE SOFTWARE OR BY OTHERWISE INDICATING ASSENT, YOU ACCEPT THIS EULA AND THIS EULA WILL BECOME A LEGAL AND ENFORCEABLE CONTRACT BETWEEN IDEAMERIT AND YOU. IF YOU DO NOT AGREE TO THESE PROVISIONS, THEN CLICK "CANCEL", "NO", "I DISAGREE" OR "CLOSE WINDOW".  

END-USER LICENSE AGREEMENT ("EULA")

1. INTRODUCTION
1.1. This EULA represents an agreement concluded between you as a licensee ("Licensee") and IDEAMERIT (as defined below) upon installation of the Software. This EULA applies from the date when the Licensee or the designated User installs the Software. If the Licensee agrees with this EULA on behalf of a company or other organization, the Licensee represents that he has the authority to bind that company or organization to this EULA. Licensee may give the right to use a Software in accordance with this EULA to an individual User.
1.2. The Licensee agrees to be bound by the terms of this EULA by installing or otherwise using the Software. If the Licensee does not agree to the terms of this EULA, the Licensee may not install or otherwise use the Software. 
1.3. IDEAMERIT reserves a right to modify this EULA, including any referenced policies and other documents in case of any updates or upgrades.

2. DEFINITIONS
2.1. For the purposes of this EULA, the following terms and phrases bear the meaning as defined below:
a) "IDEAMERIT" means Ideamerit s.r.o., with registered office in Havirov, Bludovice, Zahumenkova 1147/1c, Czech Republic, ID No. 175 96 041; 
b) "EULA" means this End-User License Agreement covering the use of the Software by individual Licensee or its User;
c) "Feedback" means any ideas, suggestions, or proposals;
d) "Licensee" means the sole proprietor or legal entity specified in the Subscription Confirmation;
e) "Software" means the product of IDEAMERIT called ${getAppTitle(
            process.env.REACT_APP_PRODUCT
          )};
f) "Subscription" means the business model under which the Licensee is provided with a licence to the Software for a specific subscription term, provided that the subscription fees are paid. Subscription does not apply to Freeware;
g)  "Subscription Confirmation" means an email confirming Licensee's rights to access and use the Software, including subscription plans, and stating the applicable use limitations for the Software (such as, for example, the number of Users and the Subscription Period);
h) "Subscription Period" specifies the subscription period ranging between 12 and 36 months from the start of the Subscription Period;
i) "User" means the individual given the right to use the Software in accordance with the EULA.

3. LICENSING OF RIGHTS
3.1. The Software is provided by IDEAMERIT to the Licensee on a "per user" basis in accordance with the Subscription Confirmation (with the exception of Perpetual license, which may be obtained without a Subscription as described in this EULA). If Licensee complies with the terms of this EULA, IDEAMERIT grants to the Licensee the rights set out in Article 8 to the extent necessary to enable Licensee and/or User to effectively use the Software.
3.2. During a Subscription Period, IDEAMERIT grants Licensee a limited, worldwide, non-exclusive, non-transferable, time-limited license to install and use the Software only on the systems owned, leased, or controlled by the Licensee. The Licensee shall not exceed the scope of Licence without a prior express written consent of IDEAMERIT.
3.3. The Licensee shall have the right to execute only one copy of the Software under one single operating system and on only one device, unless specified otherwise in the Subscription Confirmation.
3.4. Following the expiration of the Subscription, the Licensee may be granted access to the Perpetual Version of the Software in accordance with this EULA, whereby the Licensee will receive a limited version of the Software in the latest version, i.e. the Software version with existing upgrades and updates as of the date of termination of the Subscription; no further upgrades and updates will be provided following termination of the Subscription. 

4. PERPETUAL VERSION
4.1. A perpetual license ("Perpetual license") is a license that allows the Licensee to use a specific version of the Software without an active Subscription for it ("Perpetual Version").
4.2. When purchasing an annual Subscription, Licensee will immediately get a Perpetual license for the last version of the Software available prior to expiration of the Subscription Period.
4.3. The Perpetual Version does not include any Software updates or upgrades other than bug-fix updates.
4.4. Perpetual license allows Licensee to execute only one copy of the Perpetual Version of the Software under one single operating system and on only one device, unless specified otherwise in the Subscription Confirmation.  

5. TRIAL VERSION
5.1. If the Software is provided for time-limited trial purposes, the following provisions apply.
5.2. Licensee is granted a one-time right to install and use the version of the Software covered by the Subscription for evaluation purposes, without charge, for fourteen (14) days (or such other period as may be specified in the official Software documentation) from the date of Software installation ("Trial Period"). Licensee is aware that during Trial Period, the Software may contain limitations in its function as designated and decided by IDEAMERIT without any right of the Licensee to reimbursement of any direct or indirect damage. 
5.3. Licensee's use of the Software during the Trial Period shall be limited to internal evaluation and testing of the Software for the sole purpose of determining whether the Software meets the Licensee's requirements and whether the Licensee wishes to continue using the Software. During the Trial Period, the User is not entitled to use the Software for commercial purposes.
5.4. IDEAMERIT may end the Trial Period at its sole discretion at any time. Upon the expiration of the Trial Period, the Licensee's right to continue using the Software will terminate and Licensee shall (i) uninstall the Software and all its copies, (ii) procure a Freeware version of the Software under the terms specified herein, or (iii) purchase a Subscription to the Software. Software contains a feature that will automatically disable the Software upon expiration of the Trial Period. 

6. FREEWARE VERSION
6.1. Following the Trial Period, Licensee may obtain the Freeware license to the Software and if the Licensee chooses to do so, the following shall apply.
6.2. Licensee may be granted the right to install and use a freeware version of the Software ("Freeware"). The Licensee is aware that Freeware may contain limitations in its function and may expire or be terminated solely by the decision of IDEAMERIT without any right of the Licensee to reimbursement of any direct or indirect damage. 

7. EDU VERSION
7.1. Licensee may obtain the license to the Software by virtue of connection with an educational organisation (namely as a student or a teacher) and if the Licensee chooses to do so, the following shall apply.
7.2. Licensee may be granted the right to install and use a version of the Software designated to be used for educational purposes ("EDU Version"). The Licensee is aware that EDU Version may contain limitations in its function whose scope may be changed solely by the decision of IDEAMERIT without any right of the Licensee to reimbursement of any direct or indirect damage. 
7.3. Licensee is not entitled to use the EDU Version for commercial purposes. Licensee is, however, explicitly entitled to use the EDU Version for educational purposes.
7.4. The EDU version is provided by IDEAMERIT to the Licensee on a "per seat" basis, meaning the Licensee may install and activate the Software on exactly the number of devices corresponding to the number of EDU Version licenses purchased.

8. RESERVATION OF RIGHTS AND OWNERSHIP 
8.1. The Licensee will use the software in compliance with all applicable laws. The Licensee does not acquire any ownership rights in the software as a result of installing or using the software. IDEAMERIT reserves and retains all rights not expressly granted to the Licensee in this EULA, namely ownership title and interest in and to the Software, as well as all related copyrights, patents, trade secrets and other proprietary rights. The Software and all copies thereof are protected by copyright and other intellectual property laws and treaties. IDEAMERIT owns the title, copyright, and all other intellectual property rights to the software and all subsequent copies of the Software. The Software is licensed, not sold and nothing in this EULA shall be construed to convey any title or ownership rights to the Licensee.

9. LICENSEE OBLIGATIONS AND REPRESENTATIONS
9.1. The Licensee shall at all times: (a) ensure that only an authorized user (person who accesses and uses the Software) uses the Software and only in accordance with the terms and conditions of this EULA, (b) ensure that the Software is not used for rental, timesharing, subscription service, hosting or outsourcing, and (c) obtain all licenses required to use the Software within its designated country of use, if applicable.
9.2. The Licensee shall not, whether intentionally, through negligent act or omission, or without the prior written consent of IDEAMERIT, which may be withheld at IDEAMERIT's sole discretion and include certain conditions: (a) decompile; reverse engineer; disassemble; modify; adapt; create derivative works from (or otherwise attempt to derive) any part or whole of the Software; (b) directly or indirectly access or use the Software in a manner not compliant with this EULA; (c) sell; sublicense; redistribute; reproduce; transmit; circulate; disseminate; translate or reduce to or from any electronic medium or machine readable form the Software or any data/information not owned by the Licensee which is provided to the Licensee through the Software to a person who is not an authorized user; (d) vary or amend the Software; (e) except as otherwise permitted in this EULA, publish; promote; broadcast; circulate or refer publicly to IDEAMERIT's name; trade name; trademark; service mark or logo; (f) commit any act or omission the likely result of which is that IDEAMERIT's or any of its third party suppliers' reputation will be brought into disrepute or which act or omission could reasonably be expected to have or does have a material and adverse effect on IDEAMERIT's interests; (g) distribute the Software without entering into a separate distribution agreement with IDEAMERIT; or (h) copy or embed elements of unprotected and accessible code contained in the Software into other software.
9.3. The Licensee hereby represents, warrants and covenants that the Licensee will not use the Software: (a) to infringe intellectual property or proprietary rights, or rights of publicity or privacy of any third party; (b) to violate any applicable law, statute, ordinance or regulation; (c) to disseminate, transfer or store information or materials in any form or format that are harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libellous, or otherwise objectionable or that otherwise violate any law or right of any third party; (d) to disseminate any software viruses or any other computer code, files or programs that may interrupt, destroy or limit the functionality of any computer software or hardware or telecommunication equipment, or violate the security of any computer network; (e) to gather data from the Software and a database stored in the Software  (if applicable) in a manual or automatic way (e.g. using scripts, generally known as "robots") or (f) to run mail list, listserv, "bots", "robots", any kind of automatic responder, or spam, or any processes that run or are activated while the Licensee is not logged in. The Licensee remains solely responsible for all content that the Licensee uploads, posts, e-mails, transmits, or otherwise disseminates using, or in connection with, the Software. Any content accessed by the Licensee through the use of the Software is accessed at the Licensee's own risk and only the Licensee shall be solely responsible for any damage or liability to any party resulting from such access.  

10. INVESTIGATION OF UNAUTHORIZED USE AND DISTRIBUTION
10.1. If IDEAMERIT reasonably suspects that (i) the Software has been distributed to or obtained by any person or party without IDEAMERIT's prior written consent, (ii) Software is being varied or accessed or (iii) the Licensee is otherwise breaching any term of this EULA, IDEAMERIT reserves the right to require the Licensee to provide an unqualified certificate executed by the Licensee's auditor verifying compliance with the terms of this EULA. Such requests shall be made no more frequently than once per calendar year. If such an unqualified certificate is not received by IDEAMERIT within ninety (90) calendar days of being required, it will be considered that a breach of this EULA has occurred allowing IDEAMERIT to terminate the licenses granted under this EULA.

11. LIABILITY, INDEMNIFICATION AND INFRINGEMENT
11.1. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. THE LICENSEE AGREES THAT THE LICENSEE BEARS ALL RISKS ASSOCIATED WITH OR ANY MALFUNCTION OF THE SOFTWARE WITH USING OR RELYING ON THE SOFTWARE. 
11.2. IDEAMERIT SHALL NOT BE HELD LIABLE FOR THE CONTENT AND DATA PROVIDED BY THE LICENSEE OR BY THIRD PARTIES IN CONNECTION WITH THE USE OF THE SOFTWARE. THE SAME APPLIES TO THE COMPLETENESS, ACCURACY, AND UPDATING OF THE DATA PROVIDED BY THE LICENSEE OR BY THIRD PARTIES.
11.3. IDEAMERIT HEREBY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO ANY IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE RELATING TO THE SOFTWARE. IN NO EVENT SHALL IDEAMERIT BE LIABLE OR RESPONSIBLE FOR ANY CLAIM, DIRECT OR INDIRECT DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA OR PROFITS; OR BUSINESS INTERRUPTION), LOST PROFITS, LOST INFORMATION, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE.
11.4. IDEAMERIT SPECIFICALLY EXCLUDES ANY LIABILITY FOR DAMAGE OR DEFECT DUE TO NEGLECT, MISUSE, OR ATTEMPTED REPAIRS OF THE SOFTWARE. IDEAMERIT SPECIFICALLY EXCLUDES ANY LIABILITY FOR DAMAGE OR DEFECT DUE TO USE OF SOFTWARE BY LICENSEE CAUSED TO A THIRD PARTY. 
11.5. WITHOUT PREJUDICE TO THE AFOREMENTIONED, THE AGGREGATE LIABILITY OF IDEAMERIT FOR DAMAGE OR OUT OF ANY OTHER REASON UNDER THIS EULA OR ANY AGREEMENT OR CONTRACT CONCLUDED ON ITS BASIS SHALL NOT EXCEED THE NET TOTAL LICENSE FEE ACTUALLY PAID BY THE LICENSEE UNDER THIS EULA IN THE PERIOD OF TWELVE (12) MONTHS PRECEEDING THE MOMENT WHEN THE DAMAGE OCCURS.
11.6. THE LICENSEE AGREES TO PAY ALL DAMAGES INCURRED IN CONNECTION WITH THE USE OF THE SOFTWARE AND OR ANY OUTCOMES CREATED WITH IT AND/OR BREACH OF THIS EULA BY THE LICENSEE, ITS EMPLOYEES, OR BY THIRD PARTIES USING THE SOFTWARE WITH THE KNOWLEDGE OF THE LICENSEE. THE LICENSEE UNDERTAKES TO PAY ALL DAMAGES TO IDEAMERIT AND ITS SUBSIDIARIES, AFFILIATES, OFFICERS, AGENTS, AND EMPLOYEES, AND ANY RELATED DAMAGES, LOSSES, OR COSTS (INCLUDING REASONABLE ATTORNEY FEES AND COSTS), ARISING OUT OF THE LICENSEE'S USE OF THE SOFTWARE, THE LICENSEE'S VIOLATION OF THIS EULA, OR THE LICENSEE'S VIOLATION OF ANY RIGHTS OF A THIRD PARTY. 
11.7. The Licensee undertakes not to hold IDEAMERIT and /or its subsidiaries, affiliates, officers, agents, and employees or third parties using the Software with the knowledge of the Licensee, responsible for any related damages, losses, or costs (including reasonable attorney fees and costs), arising out of the Licensee's use of the Software.
11.8. The Licensee undertakes to hold IDEAMERIT harmless from any direct claim brought by a third party in connection with Licensee's and/or User's use of the Software. The Licensee upon IDEAMERIT's request undertakes to pay all damages resulting from the breach of the EULA to the third party instead of IDEAMERIT.
11.9. If the Software becomes, or in the opinion of IDEAMERIT may become, the subject of a claim of infringement of any third party's intellectual property rights, IDEAMERIT may, at its option and in its discretion: (a) procure for Licensee the right to use the Software free of any liability; (b) replace or modify the Software to make it non-infringing, c) IDEAMERIT has the right to terminate the use of license immediately without any right of the Licensee to reimbursement.

12. SUPPORT AND MAINTENANCES
12.1. Any support and maintenance of the Software shall be provided by IDEAMERIT on an available-effort basis. Failure of IDEAMERIT to provide support and maintenance will not entitle the Licensee to any remedies from IDEAMERIT.
12.2. During the Subscription Period IDEAMERIT may at its discretion provide upgrades and updates to the Software. 

13. TEMPORARY SUSPENSION
13.1. IDEAMERIT reserves the right to suspend the Licensee's and/or User's access to Software, updates or upgrades if:
a) Licensee fails to pay on time;
b) Licensee's and/or User's use of Software is in violation of this EULA or disrupts or imminently threatens the security, integrity, or availability of the Software.
c) Subscription fees have been refunded by IDEAMERIT.
13.2. If IDEAMERIT suspends User's access to Software for non-payment in accordance with Section 13.1, the Licensee shall pay all past due amounts in order to resume access to Software.

14. TERMINATION
14.1. The term of this EULA will commence upon installation of the Software by the Licensee and it will continue for the Software covered by the Subscription through the end of the applicable Subscription Period specified in the respective Subscription Confirmation, or until terminated for the Software not covered by the Subscription (unless specified otherwise by specific terms).This EULA and any license provided on its basis is automatically terminated the Licensee and/or User breaches any provision of this EULA.
14.2. IDEAMERIT and the Licensee may terminate the EULA by mutual agreement. 
14.3. If the EULA expires or is terminated or if IDEAMERIT directs in writing, the Licensee destroys all copies of the Software. If requested by IDEAMERIT, the Licensee shall provide IDEAMERIT with a certificate confirming that such destruction has been completed.
14.4. IDEAMERIT may also terminate this EULA if the Licensee becomes subject to bankruptcy proceedings, becomes insolvent, or makes an arrangement with Licensee's creditors. This EULA will terminate automatically without further notice or action by IDEAMERIT if Licensee goes into liquidation.

15. FEEDBACK
15.1. If any Feedback is submitted to IDEAMERIT, Licensee/User provides a non-exclusive, worldwide, royalty-free license that is sub-licensable and transferable, to make, use, sell, have made, offer to sell, import, reproduce, publicly display, distribute, modify, or publicly perform the Feedback in any manner without any obligation, royalty, or restriction based on intellectual property rights or otherwise to the extent permitted by law. For the avoidance of doubt, Licensee and/or User have no obligation to provide IDEAMERIT with Feedback. 

16. NON-PERSONAL, STATISTICAL DATA PROCESSING
16.1. By starting to use the Freeware version of the Software, the Licensee acknowledges and agrees that IDEAMERIT may collect and process anonymized, non-personalized, statistical data necessary for improvement of the Software and agrees not to block, electronically or otherwise, the transmission of such non-personalized data.
16.2. By starting to use the Trial version or Perpetual version of the Software, the Licensee acknowledges and agrees that IDEAMERIT may collect and process anonymized, non-personalized, statistical data necessary for improvement of the Software. The Licensee can opt-out of sending of such non-personalized data at any time by changing the settings in the Software. 

17. THIRD PARTY PROGRAMS
17.1. The software may contain third-party software programs that are available under open source or freeware software licenses and distributed, embedded or bundled together with the Software. This EULA does not alter any rights or obligations the Licensee may have under those open source or freeware software licenses. Notwithstanding anything to the contrary contained in such licenses, the disclaimer of warranties and the limitation of liability provisions in this EULA shall apply to such third-party software programs.

18. GOVERNING LAW & EXCLUSIONS
18.1. This EULA and any disputes or claims arising out of or in connection with its subject matter or formation (including non-contractual disputes or claims) are governed by and construed in accordance with the laws of the Czech Republic.
18.2. All disputes arising from the present contract and/or in connection with it shall be finally decided by the Czech court having matter-of-fact jurisdiction and determined pursuant to the registered office of IDEAMERIT.
18.3. The terms of the United Nations Convention on Contracts for the Sale of Goods do not apply to this EULA.

19. FINAL PROVISIONS
19.1. This EULA (and any addendum or amendment to this EULA which is included with the Software) is the entire agreement between the Licensee and IDEAMERIT relating to the Software and they supersede all prior or contemporaneous oral or written communications, proposals, and representations with respect to the Software or any other subject matter covered by this EULA.
19.2. By accepting this EULA, the User acknowledges that IDEAMERIT will process personal data in accordance with Privacy Policy (available at www.datensen.com). For the purpose of improvement of IDEAMERIT offering based on usage and internal records and to protect the rights of IDEAMERIT, IDEAMERIT may collect, among other things anonymous data about usage of the Software. 
19.3. All communication between IDEAMERIT and Licensee and / or User shall be via e-mail. For this purpose, the contact e-mail address of IDEAMERIT shall be available at www.datensen.com and Licensee and / or User shall provide their own e-mail addresses as a part of license purchasing process.
19.4. If IDEAMERIT fails, at any time during the term of this EULA, to insist upon strict performance of any of the licensee's obligations under this EULA, or if IDEAMERIT fails to exercise any of the rights or remedies to which it is entitled under this EULA, this shall not constitute a waiver of such rights or remedies and shall not relieve the licensee from compliance with such obligations. A waiver by IDEAMERIT of any default shall not constitute a waiver of any subsequent and/or future default. No waiver by IDEAMERIT of any of these terms and conditions shall be effective unless it is expressly stated to be a waiver and is communicated to the Licensee in writing.
19.5. Nothing in the EULA is intended to, or shall be deemed to, establish any agency, partnership, or joint venture between any of the parties, constitute any party the agent of another party, nor authorize any party to make or enter into any commitments for or on behalf of any other party.
19.6. If any provision of the EULA (or part of a provision) is found by any court or administrative body of competent jurisdiction to be invalid, unenforceable, or illegal, the other provisions shall remain in force. If any invalid, unenforceable or illegal provision would be valid, enforceable, or legal if some part of it were deleted, the provision shall apply with the minimum modification necessary to make it legal, valid, and enforceable and to give effect to the commercial intention of IDEAMERIT and the Licensee. If any invalid, unenforceable, or illegal provision cannot be remedied, IDEAMERIT and the Licensee undertake to replace such provision with a provision valid, enforceable, or legal which will to the maximum permissible extent correspond to the initial intention of IDEAMERIT and the Licensee. 

Copyright: 2023, Ideamerit s.r.o. All rights reserved.
Last updated: 03.10.2022`}

          <br />
        </pre>
      </div>
    );
  }

  getModalButton() {
    return (
      <button
        className="im-btn-default"
        data-testid={TEST_ID.MODAL_EULA.I_AGREE_BUTTON}
        onClick={this.onConfirmClick.bind(this)}
      >
        I agree
      </button>
    );
  }

  render() {
    if (
      isElectron() &&
      (window.navigator.appVersion.indexOf("Mac") !== -1 ||
        window.navigator.appVersion.indexOf("Linux") !== -1)
    ) {
      if (this.props.eulaModalIsDisplayed === true) {
        return (
          <div className="modal-wrapper">
            <Draggable handle=".modal-header">
              <div
                className="modal modal-confirm"
                data-testid={TEST_ID.MODALS.EULA}
              >
                <div className="modal-header">{this.getHeader()}</div>
                <div className="modal-content">
                  <div className="im-content-spacer-md" />
                  {this.getEula()}
                  <div className="im-content-spacer-md" />
                </div>
                <div className="modal-footer">
                  <button
                    className="im-btn-default im-margin-right"
                    onClick={this.onQuitClick.bind(this)}
                  >
                    I disagree
                  </button>
                  {this.getModalButton()}
                </div>
              </div>
            </Draggable>
          </div>
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    eulaModalIsDisplayed: state.ui.eulaModalIsDisplayed,
    settings: state.settings
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleEulaModal,
        updateSettingsProperty,
        storeSettings
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalEula)
);
