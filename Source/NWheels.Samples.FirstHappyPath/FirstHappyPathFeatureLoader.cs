﻿using NWheels.Microservices;
using NWheels.Injection;

namespace NWheels.Samples.FirstHappyPath
{
    [DefaultFeatureLoader]
    [FeatureLoader(Name = "FirstFeatureLoader")]
    public class FirstHappyPathFeatureLoader : IFeatureLoader
    {
        public void RegisterComponents(IContainer container)
        {
        }

        public void RegisterConfigSections()
        {
        }
    }
}
