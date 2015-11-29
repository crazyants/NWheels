﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Text;
using System.Threading.Tasks;
using NWheels.Authorization;
using NWheels.Authorization.Core;
using NWheels.DataObjects;
using NWheels.Domains.Security.Core;
using NWheels.Entities;

namespace NWheels.Domains.Security
{
    public interface IUserAccountDataRepository : IApplicationDataRepository
    {
        IEntityRepository<IUserAccountEntity> AllUsers { get; }
        IEntityRepository<IUserRoleEntity> UserRoles { get; }
        IEntityRepository<IOperationPermissionEntity> OperationPermissions { get; }
        IEntityRepository<IEntityAccessRuleEntity> EntityAccessRules { get; }
        IPasswordEntityPart NewPassword(string clearText);

        IAllowAllEntityAccessRuleEntity NewAllowAllEntityAccessRule();
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------

    [EntityContract(UseCodeNamespace = true)]
    public interface IUserAccountEntity : IEntityPartClaimsContainer
    {
        void SetPassword(SecureString passwordString);

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Required, PropertyContract.Unique, PropertyContract.Semantic.LoginName, PropertyContract.Semantic.DisplayName]
        string LoginName { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Required, PropertyContract.Validation.Length(min: 2, max: 100)]
        string FullName { get; set; }

        [/*PropertyContract.Required, */PropertyContract.Semantic.EmailAddress]
        string EmailAddress { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.ReadOnly]
        DateTime? EmailVerifiedAtUtc { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Required, PropertyContract.Relation.Composition]
        ICollection<IPasswordEntityPart> Passwords { get; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.ReadOnly]
        DateTime? LastLoginAtUtc { get; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.ReadOnly, PropertyContract.Validation.MinValue(0)]
        int FailedLoginCount { get; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.ReadOnly]
        bool IsLockedOut { get; }
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------

    [EntityPartContract]
    public interface IPasswordEntityPart
    {
        [PropertyContract.Required, PropertyContract.Relation.CompositionParent]
        IUserAccountEntity User { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [/*PropertyContract.Required, */PropertyContract.WriteOnly, PropertyContract.Security.Sensitive]
        string ClearText { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Required, PropertyContract.SearchOnly, PropertyContract.Security.Sensitive]
        byte[] Hash { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        DateTime? ExpiresAtUtc { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        bool MustChange { get; set; }
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------
    
    public static partial class EntityExtensions
    {
        public static bool IsExpired(this IPasswordEntityPart password, DateTime utcNow)
        {
            if ( !password.ExpiresAtUtc.HasValue )
            {
                return false;
            }

            return (utcNow >= password.ExpiresAtUtc.Value);
        }
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------

    [EntityPartContract]
    public interface IEntityPartClaim
    {
        //[PropertyContract.Required(AllowEmpty = false)]
        //string ClaimValueType { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Required(AllowEmpty = false)]
        string ClaimValue { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Validation.MaxLength(256)]
        string Description { get; set; }
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------

    [EntityPartContract]
    public interface IEntityPartClaimsContainer
    {
        [PropertyContract.Relation.ManyToMany]
        ICollection<IUserRoleEntity> AssociatedRoles { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Relation.ManyToMany]
        ICollection<IOperationPermissionEntity> AssociatedPermissions { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Relation.ManyToMany]
        ICollection<IEntityAccessRuleEntity> AssociatedEntityAccessRules { get; set; }
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------

    [EntityContract(UseCodeNamespace = true)]
    public interface IUserRoleEntity : IEntityPartUniqueDisplayName, IEntityPartClaim, IEntityPartClaimsContainer
    {
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------

    [EntityContract(UseCodeNamespace = true)]
    public interface IOperationPermissionEntity : IEntityPartUniqueDisplayName, IEntityPartClaim
    {
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------

    [EntityContract(UseCodeNamespace = true, IsAbstract = true)]
    public interface IEntityAccessRuleEntity : IEntityPartUniqueDisplayName, IEntityPartClaim, IEntityAccessRule
    {
    }
    public abstract class EntityAccessRuleEntity : IEntityAccessRuleEntity
    {
        public abstract void BuildAccessControl(IEntityAccessControlBuilder builder);

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        public abstract string Name { get; set; }
        public abstract string ClaimValue { get; set; }
        public abstract string Description { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        protected abstract void InitializeProperties();

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [EntityImplementation.TriggerOnNew]
        protected void EntityTriggerAfterNew()
        {
            InitializeProperties();
        }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [EntityImplementation.DependencyProperty]
        protected IFramework Framework { get; set; }
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------

    [EntityContract(UseCodeNamespace = true), EntityKeyGenerator.Sequential]
    public interface IDataAuditJournalEntryEntity : IEntityPartId<long>, IEntityPartCorrelationId
    {
        [PropertyContract.Required]
        IUserAccountEntity Who { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        DateTime When { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Required, PropertyContract.Validation.MaxLength(100)]
        string ModuleName { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Validation.MaxLength(100)]
        string ComponentName { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Validation.MaxLength(100)]
        string OperationName { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Required]
        string AffectedEntityName { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Required]
        string AffectedEntityId { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Required]
        string[] AffectedPropertyNames { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Required]
        string[] OldPropertyValues { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Required]
        string[] NewPropertyValues { get; set; }
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------

    [EntityPartContract]
    public interface IEntityPartAudit
    {
        DateTime CreatedAt { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Required]
        IUserAccountEntity CreatedBy { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        DateTime ModifiedAt { get; set; }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [PropertyContract.Required]
        IUserAccountEntity ModifiedBy { get; set; }
    }
}
