﻿using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using NWheels.Configuration;
using NWheels.DataObjects;
using NWheels.Processing.Messages;
using NWheels.Utilities;

namespace NWheels.Testing.Processing.Messages
{
    public class LocalFileOutgoingEmailActor : IMessageHandler<OutgoingEmailMessage>
    {
        private readonly IConfigSection _configSection;
        private string _outputFolderPath;

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        public LocalFileOutgoingEmailActor(IConfigSection configSection)
        {
            _configSection = configSection;
        }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        #region Implementation of IMessageHandler<OutgoingEmailMessage>

        public void HandleMessage(OutgoingEmailMessage message)
        {
            string subject;
            string body;
            message.FormatTemplates(out subject, out body);

            var output = new StringBuilder();

            output.AppendFormat("-- UTC DATE/TIME\r\n{0:yyyy-MM-dd HH:mm:ss}\r\n", DateTime.UtcNow);
            output.AppendFormat("-- FROM\r\n{0}\r\n", message.From != null ? message.From.DisplayName + " <" + message.From.EmailAddress + ">" : "(none)");
            output.AppendFormat("-- TO\r\n{0}", string.Join("", message.To.Select(r => r.DisplayName + " <" + r.EmailAddress + ">\r\n")));
            output.AppendFormat("-- CC\r\n{0}", string.Join("", message.Cc.Select(r => r.DisplayName + " <" + r.EmailAddress + ">\r\n")));
            output.AppendFormat("-- BCC\r\n{0}", string.Join("", message.Bcc.Select(r => r.DisplayName + " <" + r.EmailAddress + ">\r\n")));
            output.AppendFormat("-- SUBJECT\r\n{0}\r\n", subject);
            output.AppendFormat("-- BODY\r\n{0}\r\n", body);

            Thread.Sleep(10);

            EnsureOutputFolder();

            var fileName = string.Format("{0:yyyy-MM-dd-HHmm-ssfff}.{1}.txt", DateTime.UtcNow, GetSubjectFileNamePart(subject));
            File.WriteAllText(Path.Combine(_outputFolderPath, fileName), output.ToString());
        }

        #endregion

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        private void EnsureOutputFolder()
        {
            if ( _outputFolderPath == null )
            {
                _outputFolderPath = PathUtility.HostBinPath(_configSection.OutputFolderPath);

                if ( !Directory.Exists(_outputFolderPath) )
                {
                    Directory.CreateDirectory(_outputFolderPath);
                }
            }
        }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        private string GetSubjectFileNamePart(string subject)
        {
            var chars = subject
                .Where(c => c == ' ' || char.IsLetterOrDigit(c))
                .Select(c => c == ' ' ? '_' : c)
                .ToArray();

            return new string(chars);
        }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------

        [ConfigurationSection(XmlName = "Framework.Test.LocalFileOutgoingEmailActor")]
        public interface IConfigSection : IConfigurationSection
        {
            [PropertyContract.Semantic.LocalFilePath, PropertyContract.DefaultValue("Email.Out")]
            string OutputFolderPath { get; set; }
        }
    }
}