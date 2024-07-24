export enum Topics {
    User = "queuing.user",
    Order = "queuing.order",
    Ticket = "queuing.ticket",
    Notification = "queuing.notification",
    Tournament = "queuing.tournament",
}

export enum Events {
    // User
    ProfileUpdated = "profile_updated",
    // Order
    OrderExpired = "order_expired",
    OrderFulfilled = "order_fulfilled",
    OrderRefunded = "order_refunded",
    // Ticket
    TicketCreated = "ticket_created",
    // Notification
    NotificationSent = "notification_sent",
    // Tournament
    ContestantRegistered = "contestant_registered",
    ContestantCheckedIn = "contestant_checked_in",
    TournamentFinished = "tournament_finished",
}

export type EventMap = {
    [Topics.User]: {
        [Events.ProfileUpdated]: {
            event_type: Events.ProfileUpdated;
            user_id: string;
        };
    };
    [Topics.Order]: {
        [Events.OrderExpired]: {
            event_type: Events.OrderExpired;
            order_id: string;
        };
        [Events.OrderFulfilled]: {
            event_type: Events.OrderFulfilled;
            order_id: string;
        };
        [Events.OrderRefunded]: {
            event_type: Events.OrderRefunded;
            order_id: string;
        };
    };
    [Topics.Ticket]: {
        [Events.TicketCreated]: {
            event_type: Events.TicketCreated;
            ticket_id: string;
        };
    };
    [Topics.Notification]: {
        [Events.NotificationSent]: {
            event_type: Events.NotificationSent;
            notification_id: string;
            sender_id: string;
            recipient_id: string;
            notification_variant: string;
            entity_variant: string;
            entity_id: string;
            message: string;
        };
    };
    [Topics.Tournament]: {
        [Events.ContestantRegistered]: {
            event_type: Events.ContestantRegistered;
            battle_id: string;
            contestant_id: string;
        };
        [Events.ContestantCheckedIn]: {
            event_type: Events.ContestantCheckedIn;
            battle_id: string;
            contestant_id: string;
        };
        [Events.TournamentFinished]: {
            event_type: Events.TournamentFinished;
            battle_id: string;
        };
    };
};
export type EventPayload<T extends Topics> = EventMap[T][keyof EventMap[T]];

// Redefine Workflows to handle multiple topics correctly
export type Workflows<T extends Topics> = {
    [P in T]: {
        [K in keyof EventMap[P]]: (data: EventMap[P][K]) => Promise<void>;
    };
}[T];
