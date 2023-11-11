// @ts-ignore
import type {$Enums} from "@prisma/client";
import {PrismaClient} from "@prisma/client";
import { Prisma } from "@prisma/client";
import {
  ConnectionArguments,
  findManyCursorConnection,
} from "@devoxa/prisma-relay-cursor-connection";

import _Repository from './index.js'

type AsyncFn<Rtn, Args extends any[] = []> = Args extends []
  ? () => Promise<Rtn>
  : (...args: Args) => Promise<Rtn>

const client = new PrismaClient()


export class ObjectManager<
  T extends keyof Prisma.TypeMap["model"],
  Cls extends new (fields: any) => InstanceType<Cls>
> {
  constructor(private instance: any, private model: Cls) {}

  get = async (
    args?: Prisma.TypeMap["model"][T]["operations"]["findFirst"]["args"]
  ): Promise<InstanceType<Cls>> => {
    const obj = await this.instance.findFirst(args);

    if (!obj) {
      throw new Error("Object not found");
    }

    const i = new this.model(obj);

    return i;
  };

  filter = async (
    args?: Prisma.TypeMap["model"][T]["operations"]["findMany"]["args"]
  ): Promise<InstanceType<Cls>[]> => {
    const objs = await this.instance.findMany(args);

    return objs.map((obj: any) => new this.model(obj)) as InstanceType<Cls>[];
  };

  paginate = async (
    connectionArguments?: ConnectionArguments,
    args?: Prisma.TypeMap["model"][T]["operations"]["findMany"]["args"]
  ) => {
    return findManyCursorConnection(
      async (connectionArgs) => {
        const objs = await this.instance.findMany({
          ...args,
          ...connectionArgs,
        });

        return objs.map(
          (obj: any) => new this.model(obj)
        ) as InstanceType<Cls>[];
      },
      () => this.count(args as any),
      connectionArguments
    );
  };

  create = async (
    args?: Prisma.TypeMap["model"][T]["operations"]["create"]["args"]
  ): Promise<InstanceType<Cls>> => {
    const obj = await this.instance.create(args);

    return new this.model(obj);
  };

  update = async (
    args?: Prisma.TypeMap["model"][T]["operations"]["update"]["args"]
  ): Promise<InstanceType<Cls>> => {
    const obj = await this.instance.update(args);

    return new this.model(obj);
  };

  delete = async (
    args?: Prisma.TypeMap["model"][T]["operations"]["delete"]["args"]
  ): Promise<InstanceType<Cls>> => {
    const obj = await this.instance.delete(args);

    return new this.model(obj);
  };

  upsert = async (
    args?: Prisma.TypeMap["model"][T]["operations"]["upsert"]["args"]
  ): Promise<InstanceType<Cls>> => {
    const obj = await this.instance.upsert(args);

    return new this.model(obj);
  };

  count = async (
    args?: Prisma.TypeMap["model"][T]["operations"]["count"]["args"]
  ): Promise<number> => {
    return await this.instance.count(args);
  };
} 


abstract class Model {
    $save() {}
    $fetch() {}
  
    constructor() {

    }

    $boostrap(that: any, fields: any, hiddenFields: string[]) {
        for (const [key, value] of Object.entries(fields)) {
            const keyName = hiddenFields.includes(key) ? "$" + key : key;

            that[keyName as keyof this] = value as any;
        }
    }
}
  
    export class EmailTemplate extends Model {

    static objects = new ObjectManager<"EmailTemplate", typeof EmailTemplate>(
    client.emailTemplate,
    EmailTemplate
  );



    constructor(data: Prisma.EmailTemplateCreateInput) {
        super();

        const hiddenFields: string[] = ["authorizationUserId","envelopeId","parentId"];

        this.$boostrap(this, data, hiddenFields);
  }



    id!: string;
description!: string;
content!: string;
verifyReplyTo!: boolean | null;
transformer!: string | null;
authorizationUser: AsyncFn<InstanceType<typeof _Repository.AuthorizationUser> | null> = async () => {
      if (!this.$authorizationUserId) return null;
  
      
  
      return _Repository.AuthorizationUser.objects.get({
        where: {
            id:this.$authorizationUserId,
        },
      });
    };
$authorizationUserId!: string | null;
envelope: AsyncFn<InstanceType<typeof _Repository.EmailEnvelope> | null> = async () => {
      if (!this.$envelopeId) return null;
  
      
  
      return _Repository.EmailEnvelope.objects.get({
        where: {
            id:this.$envelopeId,
        },
      });
    };
$envelopeId!: string | null;
parent: AsyncFn<InstanceType<typeof _Repository.EmailTemplate> | null> = async () => {
      if (!this.$parentId) return null;
  
      
  
      return _Repository.EmailTemplate.objects.get({
        where: {
            id:this.$parentId,
        },
      });
    };
$parentId!: string | null;
linked: AsyncFn<InstanceType<typeof _Repository.EmailTemplate>[]> = async () => {
      
  
      
  
      return _Repository.EmailTemplate.objects.filter({
        where: {
            parentId:this.id,
        },
      });
    };
variables: AsyncFn<InstanceType<typeof _Repository.VariableDefinition>[]> = async () => {
      
  
      
  
      return _Repository.VariableDefinition.objects.filter({
        where: {
            emailTemplateId:this.id,
        },
      });
    };
createdBy!: string;
resourceId!: string;
createdAt!: Date;
updatedAt!: Date;

  }

export class VariableDefinition extends Model {

    static objects = new ObjectManager<"VariableDefinition", typeof VariableDefinition>(
    client.variableDefinition,
    VariableDefinition
  );



    constructor(data: Prisma.VariableDefinitionCreateInput) {
        super();

        const hiddenFields: string[] = ["emailTemplateId"];

        this.$boostrap(this, data, hiddenFields);
  }



    id!: string;
name!: string;
description!: string | null;
defaultValue!: string | null;
isRequired!: boolean | null;
isConstant!: boolean | null;
EmailTemplate: AsyncFn<InstanceType<typeof _Repository.EmailTemplate> | null> = async () => {
      if (!this.$emailTemplateId) return null;
  
      
  
      return _Repository.EmailTemplate.objects.get({
        where: {
            id:this.$emailTemplateId,
        },
      });
    };
$emailTemplateId!: string | null;

  }

export class AuthorizationUser extends Model {

    static objects = new ObjectManager<"AuthorizationUser", typeof AuthorizationUser>(
    client.authorizationUser,
    AuthorizationUser
  );



    constructor(data: Prisma.AuthorizationUserCreateInput) {
        super();

        const hiddenFields: string[] = [];

        this.$boostrap(this, data, hiddenFields);
  }



    id!: string;
userId!: string;
authorization!: string;
EmailTemplate: AsyncFn<InstanceType<typeof _Repository.EmailTemplate>[]> = async () => {
      
  
      
  
      return _Repository.EmailTemplate.objects.filter({
        where: {
            authorizationUserId:this.id,
        },
      });
    };

  }

export class EmailEnvelope extends Model {

    static objects = new ObjectManager<"EmailEnvelope", typeof EmailEnvelope>(
    client.emailEnvelope,
    EmailEnvelope
  );



    constructor(data: Prisma.EmailEnvelopeCreateInput) {
        super();

        const hiddenFields: string[] = ["fromId","replyToId"];

        this.$boostrap(this, data, hiddenFields);
  }



    id!: string;
subject!: string | null;
EmailTemplate: AsyncFn<InstanceType<typeof _Repository.EmailTemplate>[]> = async () => {
      
  
      
  
      return _Repository.EmailTemplate.objects.filter({
        where: {
            envelopeId:this.id,
        },
      });
    };
from: AsyncFn<InstanceType<typeof _Repository.EmailAddress> | null> = async () => {
      if (!this.$fromId) return null;
  
      
  
      return _Repository.EmailAddress.objects.get({
        where: {
            id:this.$fromId,
        },
      });
    };
$fromId!: string | null;
replyTo: AsyncFn<InstanceType<typeof _Repository.EmailAddress> | null> = async () => {
      if (!this.$replyToId) return null;
  
      
  
      return _Repository.EmailAddress.objects.get({
        where: {
            id:this.$replyToId,
        },
      });
    };
$replyToId!: string | null;
to: AsyncFn<InstanceType<typeof _Repository.EmailAddress>[]> = async () => {
      
  
      
  
      return _Repository.EmailAddress.objects.filter({
        where: {
            ToEnvelopes:{some:{id:this.id}},
        },
      });
    };

  }

export class EmailAddress extends Model {

    static objects = new ObjectManager<"EmailAddress", typeof EmailAddress>(
    client.emailAddress,
    EmailAddress
  );



    constructor(data: Prisma.EmailAddressCreateInput) {
        super();

        const hiddenFields: string[] = [];

        this.$boostrap(this, data, hiddenFields);
  }



    id!: string;
value!: string;
type!: $Enums.EmailAddressType;
ToEnvelopes: AsyncFn<InstanceType<typeof _Repository.EmailEnvelope>[]> = async () => {
      
  
      
  
      return _Repository.EmailEnvelope.objects.filter({
        where: {
            to:{some:{id:this.id}},
        },
      });
    };
FromEnvelopes: AsyncFn<InstanceType<typeof _Repository.EmailEnvelope>[]> = async () => {
      
  
      
  
      return _Repository.EmailEnvelope.objects.filter({
        where: {
            fromId:this.id,
        },
      });
    };
ReplyToEnvelopes: AsyncFn<InstanceType<typeof _Repository.EmailEnvelope>[]> = async () => {
      
  
      
  
      return _Repository.EmailEnvelope.objects.filter({
        where: {
            replyToId:this.id,
        },
      });
    };

  }

