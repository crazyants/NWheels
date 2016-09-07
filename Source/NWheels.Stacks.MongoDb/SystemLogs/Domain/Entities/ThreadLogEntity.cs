﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NWheels.Domains.DevOps.SystemLogs.Entities;
using NWheels.Entities;
using NWheels.Logging;
using NWheels.Stacks.MongoDb.SystemLogs.Persistence;
using NWheels.UI;

namespace NWheels.Stacks.MongoDb.SystemLogs.Domain.Entities
{
    public abstract class ThreadLogEntity : IThreadLogEntity
    {
        public void CopyFromRecord(ThreadLogRecord record)
        {
            this.Id = record.LogId;
            this.Machine = record.MachineName;
            this.Environment = record.EnvironmentName;
            this.Node = record.NodeName;
            this.Instance = record.NodeInstance;
            this.Replica = record.NodeInstanceReplica;
            this.Timestamp = record.Timestamp;
            this.TaskType = record.TaskType;
            this.RootMessageId = record.RootActivityMessageId;
            this.RootActivity = record.RootActivityText;
            this.Level = record.Level;
            this.MicrosecondsDuration = record.DurationMicroseconds;
            this.ExceptionType = record.ExceptionType;
            this.CorrelationId = record.CorrelationId;
        }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        #region Implementation of IBaseLogDimensionsEntity

        public abstract string Id { get; set; }

        public string Machine { get; private set; }
        public string Environment { get; private set; }
        public string Node { get; private set; }
        public string Instance { get; private set; }
        public string Replica { get; private set; }

        #endregion

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        #region Implementation of IThreadLogEntity

        public DateTime Timestamp { get; private set; }
        public ThreadTaskType TaskType { get; private set; }
        public string RootMessageId { get; private set; }
        public string RootActivity { get; private set; }
        public long MicrosecondsDuration { get; private set; }
        public LogLevel Level { get; private set; }
        public string ExceptionType { get; private set; }
        public string ExceptionMessage { get; private set; }
        public string CorrelationId { get; private set; }

        #endregion

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        public class HandlerExtension : ApplicationEntityService.EntityHandlerExtension<IThreadLogEntity>
        {
            public override bool CanOpenNewUnitOfWork(object txViewModel)
            {
                return true;
            }

            //-------------------------------------------------------------------------------------------------------------------------------------------------

            public override IUnitOfWork OpenNewUnitOfWork(object txViewModel)
            {
                return null;
            }
        }
    }
}