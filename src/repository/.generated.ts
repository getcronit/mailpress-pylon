// @ts-ignore
import type {$Enums} from "@prisma/client";

import { Prisma } from "@prisma/client";
import { Repository, NullableGetFunction, NullablePaginateFunction } from "@netsnek/prisma-repository";

import {Organization as OrganizationModel} from "./models/Organization";
import {User as UserModel} from "./models/User";
import {Email as EmailModel} from "./models/Email";
import {SMTPConfig as SMTPConfigModel} from "./models/SMTPConfig";
import {OAuthConfig as OAuthConfigModel} from "./models/OAuthConfig";
import {EmailTemplate as EmailTemplateModel} from "./models/EmailTemplate";
import {VariableDefinition as VariableDefinitionModel} from "./models/VariableDefinition";
import {EmailEnvelope as EmailEnvelopeModel} from "./models/EmailEnvelope";

export abstract class OrganizationRepository extends Repository {

    constructor(data: Prisma.OrganizationCreateInput) {
        super();

        const hiddenFields: string[] = ["emailId"];

        this.$boostrap(this, data, hiddenFields);
  }


    id!: string;
async users (pagination?: Parameters<typeof UserModel.objects.paginate>[0], where?: Parameters<typeof UserModel.objects.paginate>[1], orderBy?: Parameters<typeof UserModel.objects.paginate>[2]) {
      


      const _where = {
        ...where,
        organizationId:this.id
      }

        const Model = require('./models/User').User as typeof UserModel;

      try {
        return await Model.objects.paginate(
          pagination, _where, orderBy
        );
      } catch (e) {
        throw e;
      }
  
      
    };

async user (where: Parameters<typeof UserModel.objects.get>[0]) {
          
    
          where = {...where, organizationId:this.id};
    
          const Model = require('./models/User').User as typeof UserModel;
    
          try {
            return await Model.objects.get(where);
          }
          catch (e) {
            throw e;
          }
        };

async $usersAdd (data: Omit<Prisma.UserCreateArgs['data'], 'organizationId' | 'organization'> ) {
          const Model = require('./models/User').User as typeof UserModel;

          try {
            return await Model.objects.create({...data, organizationId: this.id } as any);
          } catch (e) {
            throw e
          }
        }
      
async $usersUpdate (data: Prisma.UserUpdateArgs['data'], where: Prisma.UserUpdateArgs['where']) {
          const Model = require('./models/User').User as typeof UserModel;

          try {
            return await Model.objects.update(data, {...where, organizationId: this.id || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $usersDelete (where: Omit<Prisma.UserDeleteArgs['where'], 'organizationId' | 'organization'>) {
          const Model = require('./models/User').User as typeof UserModel;

          try {
            return await Model.objects.delete({...where, organizationId: this.id || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      async email (where?: Parameters<NullableGetFunction<typeof EmailModel.objects.get>>[0], orderBy?: Parameters<NullableGetFunction<typeof EmailModel.objects.get>>[1]) {
      if (!this.$emailId) return null;


      const _where = {
        ...where,
        id:this.$emailId
      }

        const Model = require('./models/Email').Email as typeof EmailModel;

      try {
        return await Model.objects.get(
          _where, orderBy
        );
      } catch (e) {
        return null;
      }
  
      
    };

async $emailAdd (data: Omit<Prisma.EmailCreateArgs['data'], 'id'> ) {
          const Model = require('./models/Email').Email as typeof EmailModel;

          try {
            return await Model.objects.create({...data, id: this.$emailId } as any);
          } catch (e) {
            throw e
          }
        }
      
async $emailUpdate (data: Prisma.EmailUpdateArgs['data'], where: Prisma.EmailUpdateArgs['where']) {
          const Model = require('./models/Email').Email as typeof EmailModel;

          try {
            return await Model.objects.update(data, {...where, id: this.$emailId || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $emailDelete (where: Omit<Prisma.EmailDeleteArgs['where'], 'id'>) {
          const Model = require('./models/Email').Email as typeof EmailModel;

          try {
            return await Model.objects.delete({...where, id: this.$emailId || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      $emailId!: string | null;

  }

export abstract class UserRepository extends Repository {

    constructor(data: Prisma.UserCreateInput) {
        super();

        const hiddenFields: string[] = ["organizationId"];

        this.$boostrap(this, data, hiddenFields);
  }


    id!: string;
$organizationId!: string;
async emailTemplates (pagination?: Parameters<typeof EmailTemplateModel.objects.paginate>[0], where?: Parameters<typeof EmailTemplateModel.objects.paginate>[1], orderBy?: Parameters<typeof EmailTemplateModel.objects.paginate>[2]) {
      


      const _where = {
        ...where,
        creatorId:this.id
      }

        const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

      try {
        return await Model.objects.paginate(
          pagination, _where, orderBy
        );
      } catch (e) {
        throw e;
      }
  
      
    };

async emailTemplate (where: Parameters<typeof EmailTemplateModel.objects.get>[0]) {
          
    
          where = {...where, creatorId:this.id};
    
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;
    
          try {
            return await Model.objects.get(where);
          }
          catch (e) {
            throw e;
          }
        };

async $emailTemplatesAdd (data: Omit<Prisma.EmailTemplateCreateArgs['data'], 'creatorId' | 'creator'> ) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.create({...data, creatorId: this.id } as any);
          } catch (e) {
            throw e
          }
        }
      
async $emailTemplatesUpdate (data: Prisma.EmailTemplateUpdateArgs['data'], where: Prisma.EmailTemplateUpdateArgs['where']) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.update(data, {...where, creatorId: this.id || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $emailTemplatesDelete (where: Omit<Prisma.EmailTemplateDeleteArgs['where'], 'creatorId' | 'creator'>) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.delete({...where, creatorId: this.id || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      async email (where?: Parameters<NullableGetFunction<typeof EmailModel.objects.get>>[0], orderBy?: Parameters<NullableGetFunction<typeof EmailModel.objects.get>>[1]) {
      


      const _where = {
        ...where,
        userId:this.id
      }

        const Model = require('./models/Email').Email as typeof EmailModel;

      try {
        return await Model.objects.get(
          _where, orderBy
        );
      } catch (e) {
        return null;
      }
  
      
    };

async $emailAdd (data: Omit<Prisma.EmailCreateArgs['data'], 'userId' | 'user'> ) {
          const Model = require('./models/Email').Email as typeof EmailModel;

          try {
            return await Model.objects.create({...data, userId: this.id } as any);
          } catch (e) {
            throw e
          }
        }
      
async $emailUpdate (data: Prisma.EmailUpdateArgs['data'], where: Prisma.EmailUpdateArgs['where']) {
          const Model = require('./models/Email').Email as typeof EmailModel;

          try {
            return await Model.objects.update(data, {...where, userId: this.id || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $emailDelete (where: Omit<Prisma.EmailDeleteArgs['where'], 'userId' | 'user'>) {
          const Model = require('./models/Email').Email as typeof EmailModel;

          try {
            return await Model.objects.delete({...where, userId: this.id || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      async organization (where?: Parameters<typeof OrganizationModel.objects.get>[0], orderBy?: Parameters<typeof OrganizationModel.objects.get>[1]) {
      if (!this.$organizationId) throw new Error("Relation organizationId is required");


      const _where = {
        ...where,
        id:this.$organizationId
      }

        const Model = require('./models/Organization').Organization as typeof OrganizationModel;

      try {
        return await Model.objects.get(
          _where, orderBy
        );
      } catch (e) {
        throw e;
      }
  
      
    };

async $organizationAdd (data: Omit<Prisma.OrganizationCreateArgs['data'], 'id'> ) {
          const Model = require('./models/Organization').Organization as typeof OrganizationModel;

          try {
            return await Model.objects.create({...data, id: this.$organizationId } as any);
          } catch (e) {
            throw e
          }
        }
      
async $organizationUpdate (data: Prisma.OrganizationUpdateArgs['data'], where: Prisma.OrganizationUpdateArgs['where']) {
          const Model = require('./models/Organization').Organization as typeof OrganizationModel;

          try {
            return await Model.objects.update(data, {...where, id: this.$organizationId || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $organizationDelete (where: Omit<Prisma.OrganizationDeleteArgs['where'], 'id'>) {
          const Model = require('./models/Organization').Organization as typeof OrganizationModel;

          try {
            return await Model.objects.delete({...where, id: this.$organizationId || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      
  }

export abstract class EmailRepository extends Repository {

    constructor(data: Prisma.EmailCreateInput) {
        super();

        const hiddenFields: string[] = ["userId"];

        this.$boostrap(this, data, hiddenFields);
  }


    id!: string;
isEnabled!: boolean;
email!: string;
async smtpConfig (where?: Parameters<NullableGetFunction<typeof SMTPConfigModel.objects.get>>[0], orderBy?: Parameters<NullableGetFunction<typeof SMTPConfigModel.objects.get>>[1]) {
      


      const _where = {
        ...where,
        emailId:this.id
      }

        const Model = require('./models/SMTPConfig').SMTPConfig as typeof SMTPConfigModel;

      try {
        return await Model.objects.get(
          _where, orderBy
        );
      } catch (e) {
        return null;
      }
  
      
    };

async $smtpConfigAdd (data: Omit<Prisma.SMTPConfigCreateArgs['data'], 'emailId' | 'email'> ) {
          const Model = require('./models/SMTPConfig').SMTPConfig as typeof SMTPConfigModel;

          try {
            return await Model.objects.create({...data, emailId: this.id } as any);
          } catch (e) {
            throw e
          }
        }
      
async $smtpConfigUpdate (data: Prisma.SMTPConfigUpdateArgs['data'], where: Prisma.SMTPConfigUpdateArgs['where']) {
          const Model = require('./models/SMTPConfig').SMTPConfig as typeof SMTPConfigModel;

          try {
            return await Model.objects.update(data, {...where, emailId: this.id || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $smtpConfigDelete (where: Omit<Prisma.SMTPConfigDeleteArgs['where'], 'emailId' | 'email'>) {
          const Model = require('./models/SMTPConfig').SMTPConfig as typeof SMTPConfigModel;

          try {
            return await Model.objects.delete({...where, emailId: this.id || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      async oauthConfig (where?: Parameters<NullableGetFunction<typeof OAuthConfigModel.objects.get>>[0], orderBy?: Parameters<NullableGetFunction<typeof OAuthConfigModel.objects.get>>[1]) {
      


      const _where = {
        ...where,
        emailId:this.id
      }

        const Model = require('./models/OAuthConfig').OAuthConfig as typeof OAuthConfigModel;

      try {
        return await Model.objects.get(
          _where, orderBy
        );
      } catch (e) {
        return null;
      }
  
      
    };

async $oauthConfigAdd (data: Omit<Prisma.OAuthConfigCreateArgs['data'], 'emailId' | 'email'> ) {
          const Model = require('./models/OAuthConfig').OAuthConfig as typeof OAuthConfigModel;

          try {
            return await Model.objects.create({...data, emailId: this.id } as any);
          } catch (e) {
            throw e
          }
        }
      
async $oauthConfigUpdate (data: Prisma.OAuthConfigUpdateArgs['data'], where: Prisma.OAuthConfigUpdateArgs['where']) {
          const Model = require('./models/OAuthConfig').OAuthConfig as typeof OAuthConfigModel;

          try {
            return await Model.objects.update(data, {...where, emailId: this.id || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $oauthConfigDelete (where: Omit<Prisma.OAuthConfigDeleteArgs['where'], 'emailId' | 'email'>) {
          const Model = require('./models/OAuthConfig').OAuthConfig as typeof OAuthConfigModel;

          try {
            return await Model.objects.delete({...where, emailId: this.id || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      async user (where?: Parameters<NullableGetFunction<typeof UserModel.objects.get>>[0], orderBy?: Parameters<NullableGetFunction<typeof UserModel.objects.get>>[1]) {
      if (!this.$userId) return null;


      const _where = {
        ...where,
        id:this.$userId
      }

        const Model = require('./models/User').User as typeof UserModel;

      try {
        return await Model.objects.get(
          _where, orderBy
        );
      } catch (e) {
        return null;
      }
  
      
    };

async $userAdd (data: Omit<Prisma.UserCreateArgs['data'], 'id'> ) {
          const Model = require('./models/User').User as typeof UserModel;

          try {
            return await Model.objects.create({...data, id: this.$userId } as any);
          } catch (e) {
            throw e
          }
        }
      
async $userUpdate (data: Prisma.UserUpdateArgs['data'], where: Prisma.UserUpdateArgs['where']) {
          const Model = require('./models/User').User as typeof UserModel;

          try {
            return await Model.objects.update(data, {...where, id: this.$userId || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $userDelete (where: Omit<Prisma.UserDeleteArgs['where'], 'id'>) {
          const Model = require('./models/User').User as typeof UserModel;

          try {
            return await Model.objects.delete({...where, id: this.$userId || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      $userId!: string | null;
async organization (where?: Parameters<NullableGetFunction<typeof OrganizationModel.objects.get>>[0], orderBy?: Parameters<NullableGetFunction<typeof OrganizationModel.objects.get>>[1]) {
      


      const _where = {
        ...where,
        emailId:this.id
      }

        const Model = require('./models/Organization').Organization as typeof OrganizationModel;

      try {
        return await Model.objects.get(
          _where, orderBy
        );
      } catch (e) {
        return null;
      }
  
      
    };

async $organizationAdd (data: Omit<Prisma.OrganizationCreateArgs['data'], 'emailId' | 'email'> ) {
          const Model = require('./models/Organization').Organization as typeof OrganizationModel;

          try {
            return await Model.objects.create({...data, emailId: this.id } as any);
          } catch (e) {
            throw e
          }
        }
      
async $organizationUpdate (data: Prisma.OrganizationUpdateArgs['data'], where: Prisma.OrganizationUpdateArgs['where']) {
          const Model = require('./models/Organization').Organization as typeof OrganizationModel;

          try {
            return await Model.objects.update(data, {...where, emailId: this.id || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $organizationDelete (where: Omit<Prisma.OrganizationDeleteArgs['where'], 'emailId' | 'email'>) {
          const Model = require('./models/Organization').Organization as typeof OrganizationModel;

          try {
            return await Model.objects.delete({...where, emailId: this.id || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      
  }

export abstract class SMTPConfigRepository extends Repository {

    constructor(data: Prisma.SMTPConfigCreateInput) {
        super();

        const hiddenFields: string[] = ["emailId"];

        this.$boostrap(this, data, hiddenFields);
  }


    id!: string;
host!: string;
port!: number;
username!: string;
password!: string;
secure!: boolean;
async email (where?: Parameters<typeof EmailModel.objects.get>[0], orderBy?: Parameters<typeof EmailModel.objects.get>[1]) {
      if (!this.$emailId) throw new Error("Relation emailId is required");


      const _where = {
        ...where,
        id:this.$emailId
      }

        const Model = require('./models/Email').Email as typeof EmailModel;

      try {
        return await Model.objects.get(
          _where, orderBy
        );
      } catch (e) {
        throw e;
      }
  
      
    };

async $emailAdd (data: Omit<Prisma.EmailCreateArgs['data'], 'id'> ) {
          const Model = require('./models/Email').Email as typeof EmailModel;

          try {
            return await Model.objects.create({...data, id: this.$emailId } as any);
          } catch (e) {
            throw e
          }
        }
      
async $emailUpdate (data: Prisma.EmailUpdateArgs['data'], where: Prisma.EmailUpdateArgs['where']) {
          const Model = require('./models/Email').Email as typeof EmailModel;

          try {
            return await Model.objects.update(data, {...where, id: this.$emailId || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $emailDelete (where: Omit<Prisma.EmailDeleteArgs['where'], 'id'>) {
          const Model = require('./models/Email').Email as typeof EmailModel;

          try {
            return await Model.objects.delete({...where, id: this.$emailId || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      $emailId!: string;

  }

export abstract class OAuthConfigRepository extends Repository {

    constructor(data: Prisma.OAuthConfigCreateInput) {
        super();

        const hiddenFields: string[] = ["emailId"];

        this.$boostrap(this, data, hiddenFields);
  }


    id!: string;
provider!: $Enums.OAuthProvider;
accessToken!: string;
async email (where?: Parameters<typeof EmailModel.objects.get>[0], orderBy?: Parameters<typeof EmailModel.objects.get>[1]) {
      if (!this.$emailId) throw new Error("Relation emailId is required");


      const _where = {
        ...where,
        id:this.$emailId
      }

        const Model = require('./models/Email').Email as typeof EmailModel;

      try {
        return await Model.objects.get(
          _where, orderBy
        );
      } catch (e) {
        throw e;
      }
  
      
    };

async $emailAdd (data: Omit<Prisma.EmailCreateArgs['data'], 'id'> ) {
          const Model = require('./models/Email').Email as typeof EmailModel;

          try {
            return await Model.objects.create({...data, id: this.$emailId } as any);
          } catch (e) {
            throw e
          }
        }
      
async $emailUpdate (data: Prisma.EmailUpdateArgs['data'], where: Prisma.EmailUpdateArgs['where']) {
          const Model = require('./models/Email').Email as typeof EmailModel;

          try {
            return await Model.objects.update(data, {...where, id: this.$emailId || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $emailDelete (where: Omit<Prisma.EmailDeleteArgs['where'], 'id'>) {
          const Model = require('./models/Email').Email as typeof EmailModel;

          try {
            return await Model.objects.delete({...where, id: this.$emailId || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      $emailId!: string;

  }

export abstract class EmailTemplateRepository extends Repository {

    constructor(data: Prisma.EmailTemplateCreateInput) {
        super();

        const hiddenFields: string[] = ["parentId","creatorId"];

        this.$boostrap(this, data, hiddenFields);
  }


    id!: string;
description!: string;
content!: string;
verifyReplyTo!: boolean | null;
transformer!: string | null;
async envelope (where?: Parameters<NullableGetFunction<typeof EmailEnvelopeModel.objects.get>>[0], orderBy?: Parameters<NullableGetFunction<typeof EmailEnvelopeModel.objects.get>>[1]) {
      


      const _where = {
        ...where,
        emailTemplateId:this.id
      }

        const Model = require('./models/EmailEnvelope').EmailEnvelope as typeof EmailEnvelopeModel;

      try {
        return await Model.objects.get(
          _where, orderBy
        );
      } catch (e) {
        return null;
      }
  
      
    };

async $envelopeAdd (data: Omit<Prisma.EmailEnvelopeCreateArgs['data'], 'emailTemplateId' | 'emailTemplate'> ) {
          const Model = require('./models/EmailEnvelope').EmailEnvelope as typeof EmailEnvelopeModel;

          try {
            return await Model.objects.create({...data, emailTemplateId: this.id } as any);
          } catch (e) {
            throw e
          }
        }
      
async $envelopeUpdate (data: Prisma.EmailEnvelopeUpdateArgs['data'], where: Prisma.EmailEnvelopeUpdateArgs['where']) {
          const Model = require('./models/EmailEnvelope').EmailEnvelope as typeof EmailEnvelopeModel;

          try {
            return await Model.objects.update(data, {...where, emailTemplateId: this.id || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $envelopeDelete (where: Omit<Prisma.EmailEnvelopeDeleteArgs['where'], 'emailTemplateId' | 'emailTemplate'>) {
          const Model = require('./models/EmailEnvelope').EmailEnvelope as typeof EmailEnvelopeModel;

          try {
            return await Model.objects.delete({...where, emailTemplateId: this.id || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      envelopeId!: string | null;
async parent (where?: Parameters<NullableGetFunction<typeof EmailTemplateModel.objects.get>>[0], orderBy?: Parameters<NullableGetFunction<typeof EmailTemplateModel.objects.get>>[1]) {
      if (!this.$parentId) return null;


      const _where = {
        ...where,
        id:this.$parentId
      }

        const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

      try {
        return await Model.objects.get(
          _where, orderBy
        );
      } catch (e) {
        return null;
      }
  
      
    };

async $parentAdd (data: Omit<Prisma.EmailTemplateCreateArgs['data'], 'id'> ) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.create({...data, id: this.$parentId } as any);
          } catch (e) {
            throw e
          }
        }
      
async $parentUpdate (data: Prisma.EmailTemplateUpdateArgs['data'], where: Prisma.EmailTemplateUpdateArgs['where']) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.update(data, {...where, id: this.$parentId || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $parentDelete (where: Omit<Prisma.EmailTemplateDeleteArgs['where'], 'id'>) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.delete({...where, id: this.$parentId || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      $parentId!: string | null;
async links (pagination?: Parameters<typeof EmailTemplateModel.objects.paginate>[0], where?: Parameters<typeof EmailTemplateModel.objects.paginate>[1], orderBy?: Parameters<typeof EmailTemplateModel.objects.paginate>[2]) {
      


      const _where = {
        ...where,
        parentId:this.id
      }

        const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

      try {
        return await Model.objects.paginate(
          pagination, _where, orderBy
        );
      } catch (e) {
        throw e;
      }
  
      
    };

async link (where: Parameters<typeof EmailTemplateModel.objects.get>[0]) {
          
    
          where = {...where, parentId:this.id};
    
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;
    
          try {
            return await Model.objects.get(where);
          }
          catch (e) {
            throw e;
          }
        };

async $linksAdd (data: Omit<Prisma.EmailTemplateCreateArgs['data'], 'parentId' | 'parent'> ) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.create({...data, parentId: this.id } as any);
          } catch (e) {
            throw e
          }
        }
      
async $linksUpdate (data: Prisma.EmailTemplateUpdateArgs['data'], where: Prisma.EmailTemplateUpdateArgs['where']) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.update(data, {...where, parentId: this.id || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $linksDelete (where: Omit<Prisma.EmailTemplateDeleteArgs['where'], 'parentId' | 'parent'>) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.delete({...where, parentId: this.id || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      async variables (pagination?: Parameters<typeof VariableDefinitionModel.objects.paginate>[0], where?: Parameters<typeof VariableDefinitionModel.objects.paginate>[1], orderBy?: Parameters<typeof VariableDefinitionModel.objects.paginate>[2]) {
      


      const _where = {
        ...where,
        emailTemplateId:this.id
      }

        const Model = require('./models/VariableDefinition').VariableDefinition as typeof VariableDefinitionModel;

      try {
        return await Model.objects.paginate(
          pagination, _where, orderBy
        );
      } catch (e) {
        throw e;
      }
  
      
    };

async variable (where: Parameters<typeof VariableDefinitionModel.objects.get>[0]) {
          
    
          where = {...where, emailTemplateId:this.id};
    
          const Model = require('./models/VariableDefinition').VariableDefinition as typeof VariableDefinitionModel;
    
          try {
            return await Model.objects.get(where);
          }
          catch (e) {
            throw e;
          }
        };

async $variablesAdd (data: Omit<Prisma.VariableDefinitionCreateArgs['data'], 'emailTemplateId' | 'emailTemplate'> ) {
          const Model = require('./models/VariableDefinition').VariableDefinition as typeof VariableDefinitionModel;

          try {
            return await Model.objects.create({...data, emailTemplateId: this.id } as any);
          } catch (e) {
            throw e
          }
        }
      
async $variablesUpdate (data: Prisma.VariableDefinitionUpdateArgs['data'], where: Prisma.VariableDefinitionUpdateArgs['where']) {
          const Model = require('./models/VariableDefinition').VariableDefinition as typeof VariableDefinitionModel;

          try {
            return await Model.objects.update(data, {...where, emailTemplateId: this.id || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $variablesDelete (where: Omit<Prisma.VariableDefinitionDeleteArgs['where'], 'emailTemplateId' | 'emailTemplate'>) {
          const Model = require('./models/VariableDefinition').VariableDefinition as typeof VariableDefinitionModel;

          try {
            return await Model.objects.delete({...where, emailTemplateId: this.id || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      createdAt!: Date;
updatedAt!: Date;
async creator (where?: Parameters<typeof UserModel.objects.get>[0], orderBy?: Parameters<typeof UserModel.objects.get>[1]) {
      if (!this.$creatorId) throw new Error("Relation creatorId is required");


      const _where = {
        ...where,
        id:this.$creatorId
      }

        const Model = require('./models/User').User as typeof UserModel;

      try {
        return await Model.objects.get(
          _where, orderBy
        );
      } catch (e) {
        throw e;
      }
  
      
    };

async $creatorAdd (data: Omit<Prisma.UserCreateArgs['data'], 'id'> ) {
          const Model = require('./models/User').User as typeof UserModel;

          try {
            return await Model.objects.create({...data, id: this.$creatorId } as any);
          } catch (e) {
            throw e
          }
        }
      
async $creatorUpdate (data: Prisma.UserUpdateArgs['data'], where: Prisma.UserUpdateArgs['where']) {
          const Model = require('./models/User').User as typeof UserModel;

          try {
            return await Model.objects.update(data, {...where, id: this.$creatorId || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $creatorDelete (where: Omit<Prisma.UserDeleteArgs['where'], 'id'>) {
          const Model = require('./models/User').User as typeof UserModel;

          try {
            return await Model.objects.delete({...where, id: this.$creatorId || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      $creatorId!: string;

  }

export abstract class VariableDefinitionRepository extends Repository {

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
async emailTemplate (where?: Parameters<NullableGetFunction<typeof EmailTemplateModel.objects.get>>[0], orderBy?: Parameters<NullableGetFunction<typeof EmailTemplateModel.objects.get>>[1]) {
      if (!this.$emailTemplateId) return null;


      const _where = {
        ...where,
        id:this.$emailTemplateId
      }

        const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

      try {
        return await Model.objects.get(
          _where, orderBy
        );
      } catch (e) {
        return null;
      }
  
      
    };

async $emailTemplateAdd (data: Omit<Prisma.EmailTemplateCreateArgs['data'], 'id'> ) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.create({...data, id: this.$emailTemplateId } as any);
          } catch (e) {
            throw e
          }
        }
      
async $emailTemplateUpdate (data: Prisma.EmailTemplateUpdateArgs['data'], where: Prisma.EmailTemplateUpdateArgs['where']) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.update(data, {...where, id: this.$emailTemplateId || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $emailTemplateDelete (where: Omit<Prisma.EmailTemplateDeleteArgs['where'], 'id'>) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.delete({...where, id: this.$emailTemplateId || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      $emailTemplateId!: string | null;

  }

export abstract class EmailEnvelopeRepository extends Repository {

    constructor(data: Prisma.EmailEnvelopeCreateInput) {
        super();

        const hiddenFields: string[] = ["emailTemplateId"];

        this.$boostrap(this, data, hiddenFields);
  }


    id!: string;
subject!: string | null;
to!: string[];
replyTo!: string | null;
async emailTemplate (where?: Parameters<typeof EmailTemplateModel.objects.get>[0], orderBy?: Parameters<typeof EmailTemplateModel.objects.get>[1]) {
      if (!this.$emailTemplateId) throw new Error("Relation emailTemplateId is required");


      const _where = {
        ...where,
        id:this.$emailTemplateId
      }

        const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

      try {
        return await Model.objects.get(
          _where, orderBy
        );
      } catch (e) {
        throw e;
      }
  
      
    };

async $emailTemplateAdd (data: Omit<Prisma.EmailTemplateCreateArgs['data'], 'id'> ) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.create({...data, id: this.$emailTemplateId } as any);
          } catch (e) {
            throw e
          }
        }
      
async $emailTemplateUpdate (data: Prisma.EmailTemplateUpdateArgs['data'], where: Prisma.EmailTemplateUpdateArgs['where']) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.update(data, {...where, id: this.$emailTemplateId || undefined});
          } catch (e) {
            throw e
          }
          
       
            }
          
async $emailTemplateDelete (where: Omit<Prisma.EmailTemplateDeleteArgs['where'], 'id'>) {
          const Model = require('./models/EmailTemplate').EmailTemplate as typeof EmailTemplateModel;

          try {
            return await Model.objects.delete({...where, id: this.$emailTemplateId || undefined} as any);
          } catch (e) {
            throw e
          }
        }
      $emailTemplateId!: string;

  }

