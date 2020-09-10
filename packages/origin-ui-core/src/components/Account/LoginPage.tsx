import React, { useEffect, useState } from 'react';
import { LoginForm } from './LoginForm';
import { LoginNoInvitationsModal } from '../Modal/LoginNoInvitationsModal';
import { useSelector } from 'react-redux';
import { getUserState } from '../../features/users/selectors';
import { useLinks } from '../..';
import { useHistory } from 'react-router-dom';
import { OrganizationInvitationStatus } from '@energyweb/origin-backend-core';
import { PendingInvitationsModal } from '../Modal/PendingInvitationsModal';

interface IOwnProps {
    redirect?: string;
}

export const LoginPage = (props: IOwnProps) => {
    const userState = useSelector(getUserState);
    const user = userState.userOffchain;
    const pending = userState.invitations.invitations.filter(
        (i) => i.status === OrganizationInvitationStatus.Pending
    );
    const showInvitations = pending.length > 0 && !user?.organization?.id;
    const { getCertificatesLink } = useLinks();
    const history = useHistory();

    const [showRegisterOrganizationModal, setShowRegisterOrganizationModal] = useState(false);
    const [showInvitationsModal, setShowInvitationsModal] = useState(false);

    useEffect(() => {
        if (user) {
            if (!showInvitations) {
                const FIRST_LOGIN_KEY = `FIRST LOGIN ${user.id}`;
                let firstLoginItem = localStorage.getItem(FIRST_LOGIN_KEY);
                if (!firstLoginItem && user.organization?.id) {
                    localStorage.setItem(FIRST_LOGIN_KEY, 'true');
                    firstLoginItem = 'true';
                }
                if (firstLoginItem) {
                    history.push(props.redirect || getCertificatesLink());
                } else {
                    localStorage.setItem(FIRST_LOGIN_KEY, 'true');
                    setShowRegisterOrganizationModal(true);
                }
            } else {
                setShowInvitationsModal(true);
            }
        }
    }, [userState]);

    return (
        <div className="LoginPage">
            <LoginForm />
            <LoginNoInvitationsModal
                showModal={showRegisterOrganizationModal}
                setShowModal={setShowRegisterOrganizationModal}
            />
            <PendingInvitationsModal
                showModal={showInvitationsModal}
                setShowModal={setShowInvitationsModal}
                invitations={pending}
            />
        </div>
    );
};
