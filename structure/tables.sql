create table permissions
(
    id serial primary key,
    name varchar(255) not null,
    description varchar(255)
);
create table roles
(
    id serial primary key,
    name varchar(255) not null
);
create table role_permissions
(
    id serial primary key,
    role_id int references roles(id) on delete cascade,
    permission_id int references permissions(id) on delete cascade
);
create table intervenants
(
    id serial primary key,
    name varchar(255) not null,
    email varchar(255) not null,
    image varchar(255),
    login varchar(255) not null,
    password varchar(255) not null
);
create table intervenant_roles
(
    id serial primary key,
    intervenant_id int references intervenants(id) on delete cascade,
    role_id int references roles(id) on delete cascade
);
create table groups
(
    id serial primary key,
    name varchar(255) not null,
    description varchar(255)
);
create table intervenant_groups
(
    id serial primary key,
    intervenant_id int references intervenants(id) on delete cascade,
    group_id int references groups(id) on delete cascade
);
create table contracts
(
    id serial primary key,
    name varchar(255) not null,
    intervenant_id int references intervenants(id) on delete cascade,
    group_id int references groups(id) on delete cascade
);
create table intervenant_contracts
(
    id serial primary key,
    intervenant_id int references intervenants(id) on delete cascade,
    group_id int references groups(id) on delete cascade,
    contract_id int references contracts(id) on delete cascade
);
create table goals
(
    id serial primary key,
    contract_id int references contracts(id) on delete cascade,
    group_id int references groups(id) on delete cascade,
    name varchar(255) not null,
    description varchar(255)
);
create table facts
(
    id serial primary key,
    contract_id int references contracts(id) on delete cascade,
    group_id int references groups(id) on delete cascade,
    goal_id int references goals(id) on delete cascade,
    intervenant_id int references intervenants(id) on delete cascade,
    name varchar(255) not null,
    description varchar(255)
);
create table setup
(   
    id serial primary key,
    state varchar(255)
);
insert into setup (state) values ('ok');